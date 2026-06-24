import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/room.js';
import socketHandler from './socket/handler.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

socketHandler(io);

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
