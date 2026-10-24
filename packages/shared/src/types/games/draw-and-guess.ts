import { BasePublicGameState } from '../game';

export interface DrawPoint {
  x: number; // 0 to 1 normalized coordinates for resolution independence
  y: number;
}

export interface DrawStroke {
  id: string;
  points: DrawPoint[];
  color: string;
  size: number;
  isEraser: boolean;
}

export interface DrawAndGuessPublicState extends BasePublicGameState {
  gameId: 'draw-and-guess';
  drawerId: string;
  drawerNickname: string;
  wordLength: number;
  hintMask: string; // e.g. "C _ M P _ T E R"
  guessedPlayerIds: string[];
  strokes: DrawStroke[];
  wordChoices?: string[]; // Available during word selection phase
  isSelectingWord: boolean;
  roundReveal?: {
    secretWord: string;
    scoresEarned: Record<string, number>;
  };
}

export interface DrawAndGuessPrivateState {
  isDrawer: boolean;
  secretWord?: string;
  wordChoices?: string[];
  hasGuessed: boolean;
}
