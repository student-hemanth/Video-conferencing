import { Router } from 'express';
import Room from '../models/Room.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [
        { host: req.user._id },
        { 'participants.user': req.user._id },
      ],
    })
      .populate('host', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(10);
    res.json({ rooms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name } = req.body;
    const room = await Room.create({
      name: name || `${req.user.name}'s Room`,
      host: req.user._id,
    });
    res.status(201).json({ room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:roomId', protect, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId, isActive: true })
      .populate('host', 'name email avatar');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/join/:roomId', protect, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId, isActive: true });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:roomId', protect, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the host can delete this room' });
    }
    await Room.deleteOne({ roomId: req.params.roomId });
    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
