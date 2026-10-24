export type GameLifecyclePhase = 
  | 'WAITING_ROOM'
  | 'STARTING'
  | 'PLAYING'
  | 'ROUND_END'
  | 'RESULTS';

export type GameCategory = 'party' | 'trivia' | 'social' | 'arcade';

export interface GameMetadata {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: GameCategory;
  minPlayers: number;
  maxPlayers: number;
  durationMinutes: number;
  icon: string;
  accentColor: string;
  tags: string[];
}

export interface PlayerScoreSummary {
  playerId: string;
  nickname: string;
  avatar: string;
  score: number;
  delta: number;
  rank: number;
  isWinner?: boolean;
}

export interface BasePublicGameState {
  gameId: string;
  phase: GameLifecyclePhase;
  round: number;
  totalRounds: number;
  deadline: number | null; // Authoritative UTC timestamp in ms
  timeRemainingMs: number;
  scores: Record<string, number>;
  leaderboard: PlayerScoreSummary[];
}

export interface GameResultPayload {
  gameId: string;
  winnerIds: string[];
  finalStandings: PlayerScoreSummary[];
  statistics: Record<string, string | number>;
  completedAt: number;
}
