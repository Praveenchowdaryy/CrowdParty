import { BasePublicGameState } from '../game';

export interface MostLikelyToPrompt {
  id: string;
  prompt: string;
  category: string;
}

export interface MostLikelyToPublicState extends BasePublicGameState {
  gameId: 'most-likely-to';
  currentPrompt: {
    id: string;
    prompt: string;
    category: string;
  } | null;
  votedPlayerIds: string[];
  roundReveal: {
    winnerId: string;
    winnerNickname: string;
    winnerAvatar: string;
    voteCount: number;
    votesByPlayer: Record<string, string[]>; // targetPlayerId -> voterNicknames[]
    scoresEarned: Record<string, number>;
  } | null;
}

export interface MostLikelyToPrivateState {
  hasVoted: boolean;
  myVotePlayerId?: string;
}
