import Room from '../models/Room.js';
import jwt from 'jsonwebtoken';

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', async ({ roomId, user }) => {
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.user = user;

      try {
        const room = await Room.findOne({ roomId });
        if (room) {
          const existing = room.participants.find(
            (p) => p.user?.toString() === user.id
          );
          if (!existing) {
            room.participants.push({
              user: user.id,
              name: user.name,
              socketId: socket.id,
            });
            await room.save();
          }
        }
      } catch (err) {
        console.error('join-room error:', err.message);
      }

      socket.to(roomId).emit('user-joined', {
        userId: user.id,
        name: user.name,
        socketId: socket.id,
      });

      const sockets = await io.in(roomId).fetchSockets();
      const users = sockets
        .filter((s) => s.data.user)
        .map((s) => ({ ...s.data.user, socketId: s.id }));

      socket.emit('room-users', { users });
    });

    socket.on('signal', ({ to, signal }) => {
      io.to(to).emit('signal', {
        from: socket.id,
        signal,
        user: socket.data.user,
      });
    });

    socket.on('send-message', ({ roomId, message }) => {
      const user = socket.data.user;
      if (!user) return;

      const msg = {
        userId: user.id,
        name: user.name,
        message,
        timestamp: new Date().toISOString(),
      };

      io.to(roomId).emit('receive-message', msg);
    });

    socket.on('toggle-audio', ({ roomId, enabled }) => {
      socket.to(roomId).emit('user-audio-changed', {
        userId: socket.data.user?.id,
        enabled,
      });
    });

    socket.on('toggle-video', ({ roomId, enabled }) => {
      socket.to(roomId).emit('user-video-changed', {
        userId: socket.data.user?.id,
        enabled,
      });
    });

    socket.on('screen-share', ({ roomId, enabled }) => {
      socket.to(roomId).emit('screen-share-changed', {
        userId: socket.data.user?.id,
        enabled,
      });
    });

    socket.on('disconnect', async () => {
      const { roomId, user } = socket.data;

      if (roomId && user) {
        socket.to(roomId).emit('user-left', { userId: user.id, socketId: socket.id });

        try {
          await Room.findOneAndUpdate(
            { roomId },
            { $pull: { participants: { socketId: socket.id } } }
          );
        } catch (err) {
          console.error('disconnect error:', err.message);
        }

        const sockets = await io.in(roomId).fetchSockets();
        const users = sockets
          .filter((s) => s.data.user)
          .map((s) => ({ ...s.data.user, socketId: s.id }));

        socket.to(roomId).emit('room-users', { users });
      }

      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export default socketHandler;
