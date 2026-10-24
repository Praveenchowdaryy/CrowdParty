export interface Player {
  id: string;
  nickname: string;
  avatar: string;
  isHost: boolean;
  isOnline: boolean;
  isReady: boolean;
  score: number;
  lastActive: number;
  isBot?: boolean;
}

export type RoomStatus = 'LOBBY' | 'IN_GAME';

export interface RoomSettings {
  maxPlayers: number;
  isPrivate: boolean;
  allowLateJoin: boolean;
}

export type ChatMessageType = 'CHAT' | 'SYSTEM' | 'GUESS_CORRECT' | 'GUESS_CLOSE';

export interface ChatMessage {
  id: string;
  playerId: string;
  nickname: string;
  avatar: string;
  text: string;
  timestamp: number;
  type: ChatMessageType;
}

export interface EmojiReaction {
  id: string;
  playerId: string;
  emoji: string;
  timestamp: number;
}

export interface RoomSnapshot {
  code: string;
  hostId: string;
  status: RoomStatus;
  selectedGameId: string;
  players: Player[];
  settings: RoomSettings;
  createdAt: number;
}
