import { BasePublicGameState } from '../game';

export type ArenaStatus = 'WAITING_TO_START' | 'WAITING_SIGNAL' | 'SIGNAL_ACTIVE' | 'ROUND_RESULTS';

export interface ReactionPlayerResult {
  playerId: string;
  nickname: string;
  avatar: string;
  reactionTimeMs: number | null; // null if false start or timed out
  isFalseStart: boolean;
  scoreEarned: number;
  rank: number;
}

export interface ReactionArenaPublicState extends BasePublicGameState {
  gameId: 'reaction-arena';
  arenaStatus: ArenaStatus;
  signalTriggeredAt: number | null; // ms timestamp when green signal fired
  results: ReactionPlayerResult[];
  reactedPlayerIds: string[];
}

export interface ReactionArenaPrivateState {
  hasReacted: boolean;
  myReactionTimeMs?: number | null;
  isFalseStart?: boolean;
}
