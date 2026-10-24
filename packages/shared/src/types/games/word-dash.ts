import { BasePublicGameState } from '../game';

export interface WordDashWord {
  id: string;
  scrambled: string;
  answer: string;
  category: string;
  clue: string;
}

export interface WordDashPublicState extends BasePublicGameState {
  gameId: 'word-dash';
  currentWord: {
    id: string;
    scrambled: string;
    category: string;
    clue: string;
    wordLength: number;
  } | null;
  solvedPlayerIds: string[];
  roundReveal: {
    answer: string;
    fastestPlayerNickname?: string;
    fastestTimeMs?: number;
    scoresEarned: Record<string, number>;
  } | null;
}

export interface WordDashPrivateState {
  hasSolved: boolean;
  mySolveTimeMs?: number;
  myPointsEarned?: number;
}
