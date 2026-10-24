import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '@crowdparty/shared';

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || `http://${defaultHost}:4000`;
    socket = io(socketUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function saveSession(roomCode: string, token: string, nickname: string, avatar: string) {
  if (typeof window === 'undefined') return;
  const sessionData = {
    roomCode: roomCode.toUpperCase(),
    token,
    nickname,
    avatar,
    timestamp: Date.now(),
  };
  localStorage.setItem(`cp_session_${roomCode.toUpperCase()}`, JSON.stringify(sessionData));
  localStorage.setItem('cp_last_user', JSON.stringify({ nickname, avatar }));
}

export function getSavedSession(roomCode: string): { token: string; nickname: string; avatar: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(`cp_session_${roomCode.toUpperCase()}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getLastUserProfile(): { nickname: string; avatar: string } {
  if (typeof window === 'undefined') return { nickname: '', avatar: 'cat' };
  const raw = localStorage.getItem('cp_last_user');
  if (!raw) return { nickname: '', avatar: 'cat' };
  try {
    return JSON.parse(raw);
  } catch {
    return { nickname: '', avatar: 'cat' };
  }
}
