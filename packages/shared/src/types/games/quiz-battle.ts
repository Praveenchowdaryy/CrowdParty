import { BasePublicGameState } from '../game';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestionPublic {
  id: string;
  category: string;
  question: string;
  options: QuizOption[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizBattlePublicState extends BasePublicGameState {
  gameId: 'quiz-battle';
  questionIndex: number;
  totalQuestions: number;
  currentQuestion: QuizQuestionPublic | null;
  answeredPlayerIds: string[];
  roundReveal?: {
    correctOptionId: string;
    explanation?: string;
    playerAnswers: Record<string, string>; // playerId -> optionId
    scoresEarned: Record<string, number>;
  };
}

export interface QuizBattlePrivateState {
  hasAnswered: boolean;
  selectedOptionId?: string;
  answerTimeMs?: number;
}
