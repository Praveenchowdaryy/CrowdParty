import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  RoomSettings,
} from '@crowdparty/shared';
import { RoomManager } from '../room/RoomManager';

export function setupSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>
) {
  const roomManager = RoomManager.getInstance();

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    let currentRoomCode: string | null = null;
    let currentPlayerId: string | null = null;

    socket.on('room:create', ({ nickname, avatar, settings }, callback) => {
      try {
        const room = roomManager.createRoom();
        if (settings) {
          room.settings = { ...room.settings, ...settings };
        }

        const { player, sessionToken } = room.addPlayer(nickname, avatar, socket as any);
        currentRoomCode = room.code;
        currentPlayerId = player.id;
        socket.join(room.code);

        callback({
          success: true,
          roomCode: room.code,
          sessionToken,
        });
      } catch (err: any) {
        callback({
          success: false,
          error: err.message || 'Failed to create room',
        });
      }
    });

    socket.on('room:join', ({ roomCode, nickname, avatar, sessionToken }, callback) => {
      try {
        const room = roomManager.getRoom(roomCode);
        if (!room) {
          return callback({
            success: false,
            error: 'Room not found or code expired',
          });
        }

        const { player, sessionToken: newToken } = room.addPlayer(
          nickname,
          avatar,
          socket as any,
          sessionToken
        );

        currentRoomCode = room.code;
        currentPlayerId = player.id;
        socket.join(room.code);

        callback({
          success: true,
          roomCode: room.code,
          sessionToken: newToken,
        });
      } catch (err: any) {
        callback({
          success: false,
          error: err.message || 'Failed to join room',
        });
      }
    });

    socket.on('room:reconnect', ({ roomCode, sessionToken }, callback) => {
      try {
        const room = roomManager.getRoom(roomCode);
        if (!room) {
          return callback({ success: false, error: 'Room expired or not found' });
        }

        const playerId = room.sessionTokens.get(sessionToken);
        if (!playerId) {
          return callback({ success: false, error: 'Invalid reconnection session' });
        }

        const player = room.players.get(playerId);
        if (!player) {
          return callback({ success: false, error: 'Player record not found' });
        }

        player.isOnline = true;
        room.playerSockets.set(playerId, socket as any);
        currentRoomCode = room.code;
        currentPlayerId = playerId;
        socket.join(room.code);

        room.sendRoomSnapshot(socket as any);
        if (room.activeGame) {
          room.sendGameStateToPlayer(playerId);
        }

        callback({ success: true });
      } catch (err: any) {
        callback({ success: false, error: err.message || 'Reconnection error' });
      }
    });

    socket.on('room:leave', () => {
      if (currentRoomCode && currentPlayerId) {
        const room = roomManager.getRoom(currentRoomCode);
        if (room) {
          room.removePlayer(currentPlayerId, 'Player left room');
        }
        socket.leave(currentRoomCode);
        currentRoomCode = null;
        currentPlayerId = null;
      }
    });

    socket.on('room:set_ready', ({ isReady }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room) {
        room.setPlayerReady(currentPlayerId, isReady);
      }
    });

    socket.on('room:select_game', ({ gameId }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room) {
        try {
          room.selectGame(currentPlayerId, gameId);
        } catch (err: any) {
          socket.emit('error', { message: err.message });
        }
      }
    });

    socket.on('room:update_settings', ({ settings }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room) {
        try {
          room.updateSettings(currentPlayerId, settings);
        } catch (err: any) {
          socket.emit('error', { message: err.message });
        }
      }
    });

    socket.on('room:start_game', () => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room) {
        try {
          room.startGame(currentPlayerId);
        } catch (err: any) {
          socket.emit('error', { message: err.message });
        }
      }
    });

    socket.on('room:return_to_lobby', () => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room) {
        try {
          room.returnToLobby(currentPlayerId);
        } catch (err: any) {
          socket.emit('error', { message: err.message });
        }
      }
    });

    socket.on('room:add_bot', (callback) => {
      if (!currentRoomCode) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room) {
        room.addBot();
        if (callback) callback({ success: true });
      }
    });

    socket.on('room:remove_bot', ({ botId }) => {
      if (!currentRoomCode) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room) {
        room.removeBot(botId);
      }
    });

    socket.on('chat:send', ({ text }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room) {
        room.handleChatMessage(currentPlayerId, text);
      }
    });

    socket.on('reaction:send', ({ emoji }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room) {
        room.sendReaction(currentPlayerId, emoji);
      }
    });

    socket.on('game:action', ({ type, payload }, callback) => {
      if (!currentRoomCode || !currentPlayerId) {
        if (callback) callback({ success: false, error: 'Not in a room' });
        return;
      }
      const room = roomManager.getRoom(currentRoomCode);
      if (!room || !room.activeGame) {
        if (callback) callback({ success: false, error: 'No active game' });
        return;
      }

      const res = room.activeGame.handleAction(currentPlayerId, { type, payload });
      if (callback) callback(res);
    });

    socket.on('game:draw_stroke', (stroke) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room && room.activeGame) {
        room.activeGame.handleAction(currentPlayerId, {
          type: 'draw_stroke',
          payload: stroke,
        });
      }
    });

    socket.on('game:clear_canvas', () => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room && room.activeGame) {
        room.activeGame.handleAction(currentPlayerId, {
          type: 'clear_canvas',
          payload: {},
        });
      }
    });

    socket.on('disconnect', () => {
      if (currentRoomCode && currentPlayerId) {
        const room = roomManager.getRoom(currentRoomCode);
        if (room) {
          room.removePlayer(currentPlayerId, 'Connection closed');
        }
      }
    });
  });
}
