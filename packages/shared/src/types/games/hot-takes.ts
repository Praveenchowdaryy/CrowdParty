import { BasePublicGameState } from '../game';

export interface HotTakePrompt {
  id: string;
  category: string;
  scenario: string;
  optionA: string;
  optionB: string;
}

export interface HotTakesPublicState extends BasePublicGameState {
  gameId: 'hot-takes';
  promptIndex: number;
  totalPrompts: number;
  currentPrompt: HotTakePrompt | null;
  votedPlayerIds: string[];
  roundReveal?: {
    votesA: string[]; // playerIds
    votesB: string[]; // playerIds
    percentA: number;
    percentB: number;
    majority: 'A' | 'B' | 'TIE';
    scoresEarned: Record<string, number>;
  };
}

export interface HotTakesPrivateState {
  hasVoted: boolean;
  myVote?: 'A' | 'B';
  myPrediction?: 'A' | 'B';
}
