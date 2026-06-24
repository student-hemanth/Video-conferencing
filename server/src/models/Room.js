import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const participantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  socketId: String,
  joinedAt: { type: Date, default: Date.now },
  audioEnabled: { type: Boolean, default: true },
  videoEnabled: { type: Boolean, default: true },
  screenSharing: { type: Boolean, default: false },
}, { _id: false });

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    unique: true,
    default: () => uuidv4().slice(0, 8),
  },
  name: {
    type: String,
    default: 'Untitled Room',
    trim: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [participantSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
