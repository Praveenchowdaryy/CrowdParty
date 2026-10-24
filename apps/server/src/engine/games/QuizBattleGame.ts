import {
  QuizBattlePublicState,
  QuizBattlePrivateState,
  QuizQuestionPublic,
} from '@crowdparty/shared';
import { BaseGame } from '../BaseGame';
import { Room } from '../../room/Room';

interface InternalQuizQuestion {
  id: string;
  category: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const QUIZ_QUESTIONS: InternalQuizQuestion[] = [
  {
    id: 'tech-1',
    category: 'Technology',
    question: 'What does the "HTTP" status code 418 represent according to RFC 2324?',
    options: [
      { id: 'a', text: 'Bad Gateway' },
      { id: 'b', text: "I'm a teapot" },
      { id: 'c', text: 'Network Authentication Required' },
      { id: 'd', text: 'Too Many Requests' },
    ],
    correctOptionId: 'b',
    explanation: 'RFC 2324 defined the Hyper Text Coffee Pot Control Protocol as an April Fools joke specifying "418 I\'m a teapot".',
    difficulty: 'medium',
  },
  {
    id: 'prog-1',
    category: 'Programming',
    question: 'In JavaScript, what is the output of `typeof NaN`?',
    options: [
      { id: 'a', text: '"number"' },
      { id: 'b', text: '"undefined"' },
      { id: 'c', text: '"nan"' },
      { id: 'd', text: '"object"' },
    ],
    correctOptionId: 'a',
    explanation: 'In the IEEE 754 floating-point standard and JavaScript, NaN is formally a special numeric value.',
    difficulty: 'easy',
  },
  {
    id: 'movie-1',
    category: 'Movies',
    question: 'Which movie won the first Academy Award for Best Animated Feature in 2002?',
    options: [
      { id: 'a', text: 'Monsters, Inc.' },
      { id: 'b', text: 'Shrek' },
      { id: 'c', text: 'Jimmy Neutron: Boy Genius' },
      { id: 'd', text: 'Ice Age' },
    ],
    correctOptionId: 'b',
    explanation: 'DreamWorks\' Shrek won the inaugural Best Animated Feature Oscar at the 74th Academy Awards.',
    difficulty: 'easy',
  },
  {
    id: 'office-1',
    category: 'Office Trivia',
    question: 'What does the acronym "EOD" typically mean in workplace communication?',
    options: [
      { id: 'a', text: 'End of Discussion' },
      { id: 'b', text: 'Every Other Day' },
      { id: 'c', text: 'End of Day' },
      { id: 'd', text: 'Estimate on Delivery' },
    ],
    correctOptionId: 'c',
    explanation: 'EOD stands for "End of Day", usually meaning close of business (5 PM or 6 PM).',
    difficulty: 'easy',
  },
  {
    id: 'gk-1',
    category: 'General Knowledge',
    question: 'Which element on the periodic table has the chemical symbol "W"?',
    options: [
      { id: 'a', text: 'Tungsten' },
      { id: 'b', text: 'Wolframite' },
      { id: 'c', text: 'Titanium' },
      { id: 'd', text: 'Tin' },
    ],
    correctOptionId: 'a',
    explanation: 'Tungsten has the symbol W from its historic German name "Wolfram".',
    difficulty: 'medium',
  },
  {
    id: 'prog-2',
    category: 'Programming',
    question: 'What is the average time complexity of searching in a balanced Hash Table?',
    options: [
      { id: 'a', text: 'O(log n)' },
      { id: 'b', text: 'O(1)' },
      { id: 'c', text: 'O(n)' },
      { id: 'd', text: 'O(n log n)' },
    ],
    correctOptionId: 'b',
    explanation: 'Hash tables offer constant time average O(1) lookup.',
    difficulty: 'easy',
  },
  {
    id: 'sports-1',
    category: 'Sports',
    question: 'How many players are on the field for one team in a standard soccer (football) match?',
    options: [
      { id: 'a', text: '9' },
      { id: 'b', text: '10' },
      { id: 'c', text: '11' },
      { id: 'd', text: '12' },
    ],
    correctOptionId: 'c',
    explanation: 'Each soccer team has 11 players on the pitch, including the goalkeeper.',
    difficulty: 'easy',
  },
  {
    id: 'tech-2',
    category: 'Technology',
    question: 'Which company created the TypeScript programming language in 2012?',
    options: [
      { id: 'a', text: 'Google' },
      { id: 'b', text: 'Microsoft' },
      { id: 'c', text: 'Meta' },
      { id: 'd', text: 'Mozilla' },
    ],
    correctOptionId: 'b',
    explanation: 'TypeScript was designed by Anders Hejlsberg at Microsoft and released in October 2012.',
    difficulty: 'easy',
  },
];

export class QuizBattleGame extends BaseGame {
  public readonly id = 'quiz-battle';
  private selectedQuestions: InternalQuizQuestion[] = [];
  private currentQuestionIndex: number = -1;
  private playerAnswers: Record<string, { optionId: string; timeMs: number }> = {};
  private roundScoresEarned: Record<string, number> = {};

  constructor(room: Room) {
    super(room);
    // Shuffle and pick 5 questions per game
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    this.selectedQuestions = shuffled.slice(0, 5);
    this.totalRounds = this.selectedQuestions.length;
  }

  public start(): void {
    this.nextQuestion();
  }

  private nextQuestion(): void {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex >= this.selectedQuestions.length) {
      this.finishGame();
      return;
    }

    this.round = this.currentQuestionIndex + 1;
    this.playerAnswers = {};
    this.roundScoresEarned = {};
    this.phase = 'PLAYING';
    // 15 seconds per question
    this.deadline = Date.now() + 15000;
    this.roundStartTime = Date.now();

    const q = this.selectedQuestions[this.currentQuestionIndex];
    this.room.sendSystemMessage(`❓ Question ${this.round}/${this.totalRounds} (${q.category}): ${q.question}`);
    this.room.broadcastState();
  }

  public handleAction(
    playerId: string,
    action: { type: string; payload: any }
  ): { success: boolean; error?: string } {
    if (this.isDisposed) return { success: false, error: 'Game finished' };

    if (action.type === 'submit_answer') {
      if (this.phase !== 'PLAYING') {
        return { success: false, error: 'Not in answering phase' };
      }

      if (this.playerAnswers[playerId]) {
        return { success: false, error: 'Answer already submitted' };
      }

      const optionId = action.payload?.optionId;
      const currentQ = this.selectedQuestions[this.currentQuestionIndex];
      const validOption = currentQ?.options.some(o => o.id === optionId);

      if (!validOption) {
        return { success: false, error: 'Invalid answer option' };
      }

      const answerTime = Date.now() - this.roundStartTime;
      this.playerAnswers[playerId] = { optionId, timeMs: answerTime };

      // Check if all active players have answered
      const activePlayerCount = Array.from(this.room.players.values()).filter(p => p.isOnline).length;
      if (Object.keys(this.playerAnswers).length >= activePlayerCount && activePlayerCount > 0) {
        this.revealAnswers();
      } else {
        this.room.broadcastState();
      }

      return { success: true };
    }

    return { success: false, error: 'Unknown action' };
  }

  private revealAnswers(): void {
    this.phase = 'ROUND_END';
    // 6 seconds reveal countdown
    this.deadline = Date.now() + 6000;

    const currentQ = this.selectedQuestions[this.currentQuestionIndex];
    const totalTimeMs = 15000;

    // Calculate scores
    for (const [playerId, answer] of Object.entries(this.playerAnswers)) {
      if (answer.optionId === currentQ.correctOptionId) {
        const remainingTime = Math.max(0, totalTimeMs - answer.timeMs);
        const speedBonus = Math.floor((remainingTime / totalTimeMs) * 200);
        const earned = 300 + speedBonus; // 300 to 500 points
        this.scores[playerId] = (this.scores[playerId] || 0) + earned;
        this.roundScoresEarned[playerId] = earned;
      } else {
        this.roundScoresEarned[playerId] = 0;
      }
    }

    this.room.broadcastState();
  }

  public tick(now: number): void {
    if (this.isDisposed) return;

    if (this.deadline && now >= this.deadline) {
      if (this.phase === 'PLAYING') {
        this.revealAnswers();
      } else if (this.phase === 'ROUND_END') {
        this.nextQuestion();
      }
    }
  }

  public getPublicState(): QuizBattlePublicState {
    const now = Date.now();
    const timeRemainingMs = this.deadline ? Math.max(0, this.deadline - now) : 0;
    const currentQ = this.selectedQuestions[this.currentQuestionIndex];

    const publicQ: QuizQuestionPublic | null = currentQ ? {
      id: currentQ.id,
      category: currentQ.category,
      question: currentQ.question,
      options: currentQ.options,
      difficulty: currentQ.difficulty,
    } : null;

    const playerAnswerMap: Record<string, string> = {};
    if (this.phase === 'ROUND_END' || this.phase === 'RESULTS') {
      for (const [pId, ans] of Object.entries(this.playerAnswers)) {
        playerAnswerMap[pId] = ans.optionId;
      }
    }

    return {
      gameId: 'quiz-battle',
      phase: this.phase,
      round: this.round,
      totalRounds: this.totalRounds,
      deadline: this.deadline,
      timeRemainingMs,
      scores: { ...this.scores },
      leaderboard: this.getLeaderboard(),
      questionIndex: this.currentQuestionIndex,
      totalQuestions: this.totalRounds,
      currentQuestion: publicQ,
      answeredPlayerIds: Object.keys(this.playerAnswers),
      roundReveal: (this.phase === 'ROUND_END' || this.phase === 'RESULTS') && currentQ ? {
        correctOptionId: currentQ.correctOptionId,
        explanation: currentQ.explanation,
        playerAnswers: playerAnswerMap,
        scoresEarned: this.roundScoresEarned,
      } : undefined,
    };
  }

  public getPrivateState(playerId: string): QuizBattlePrivateState {
    const ans = this.playerAnswers[playerId];
    return {
      hasAnswered: !!ans,
      selectedOptionId: ans?.optionId,
      answerTimeMs: ans?.timeMs,
    };
  }
}
