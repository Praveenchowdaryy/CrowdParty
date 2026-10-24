import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  GAME_CATALOGUE,
} from '@crowdparty/shared';
import { setupSocketHandlers } from './socket/socketHandler';
import { RoomManager } from './room/RoomManager';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());

const roomManager = RoomManager.getInstance();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    activeRooms: roomManager.rooms.size,
  });
});

// Game catalogue endpoint
app.get('/api/games', (req, res) => {
  res.json({
    games: GAME_CATALOGUE,
  });
});

// Room verification endpoint
app.get('/api/rooms/:code', (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const room = roomManager.getRoom(code);

  if (!room) {
    return res.status(404).json({
      exists: false,
      error: 'Room not found or code expired',
    });
  }

  res.json({
    exists: true,
    code: room.code,
    status: room.status,
    playerCount: room.players.size,
    maxPlayers: room.settings.maxPlayers,
    selectedGameId: room.selectedGameId,
    allowLateJoin: room.settings.allowLateJoin,
    canJoin: room.players.size < room.settings.maxPlayers && (room.status === 'LOBBY' || room.settings.allowLateJoin),
  });
});

// Abusive content / user report endpoint
app.post('/api/reports', (req, res) => {
  const { roomCode, reporterId, reportedId, reason, textContent } = req.body || {};
  if (!roomCode || !reportedId || !reason) {
    return res.status(400).json({ error: 'Missing required report fields' });
  }

  console.log(`[MODERATION REPORT] Room: ${roomCode}, Reported: ${reportedId}, Reason: ${reason}`);
  res.status(201).json({ success: true, message: 'Report received and queued for review' });
});

const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 20000,
  pingInterval: 10000,
});

setupSocketHandlers(io);

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🎮 CrowdParty Real-Time Game Server running on port ${PORT} (0.0.0.0)`);
  console.log(`✨ Health check: http://localhost:${PORT}/health`);
});

// Graceful termination
const shutdown = () => {
  console.log('Shutting down server gracefully...');
  roomManager.dispose();
  io.close(() => {
    server.close(() => {
      console.log('Server terminated');
      process.exit(0);
    });
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
