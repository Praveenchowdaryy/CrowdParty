import {
  WordDashPublicState,
  WordDashPrivateState,
  WordDashWord,
} from '@crowdparty/shared';
import { BaseGame } from '../BaseGame';
import { Room } from '../../room/Room';

const WORD_DASH_BANK: WordDashWord[] = [
  {
    id: 'wd-1',
    scrambled: 'T H Y P O N',
    answer: 'PYTHON',
    category: 'Programming & Tech',
    clue: 'Famous programming language named after a comedy troupe',
  },
  {
    id: 'wd-2',
    scrambled: 'R E T T I W T',
    answer: 'TWITTER',
    category: 'Social Media',
    clue: 'The bird app that rebranded to a single letter',
  },
  {
    id: 'wd-3',
    scrambled: 'B U R G R E',
    answer: 'BURGER',
    category: 'Food & Drinks',
    clue: 'Beloved fast food sandwich between two sesame buns',
  },
  {
    id: 'wd-4',
    scrambled: 'G I T H U B',
    answer: 'GITHUB',
    category: 'Developer Culture',
    clue: 'Where software developers push code and collaborate',
  },
  {
    id: 'wd-5',
    scrambled: 'R A V A T A',
    answer: 'AVATAR',
    category: 'Movies & Sci-Fi',
    clue: 'James Cameron blockbuster set on the moon Pandora',
  },
  {
    id: 'wd-6',
    scrambled: 'C O F F E E',
    answer: 'COFFEE',
    category: 'Fuel for Engineers',
    clue: 'Roasted bean brew that turns caffeine into software',
  },
  {
    id: 'wd-7',
    scrambled: 'K E T C O R',
    answer: 'ROCKET',
    category: 'Space & Exploration',
    clue: 'Vessel designed to blast off beyond the stratosphere',
  },
  {
    id: 'wd-8',
    scrambled: 'N I N J A S',
    answer: 'NINJAS',
    category: 'Gaming & Stealth',
    clue: 'Ancient covert warriors of stealth and martial arts',
  },
];

export class WordDashGame extends BaseGame {
  public readonly id = 'word-dash';
  private words: WordDashWord[] = [];
  private currentWordIndex: number = -1;
  private solvedPlayers: Map<string, { solveTimeMs: number; points: number }> = new Map();
  private fastestSolver: { nickname: string; timeMs: number } | null = null;
  private roundScoresEarned: Record<string, number> = {};

  constructor(room: Room) {
    super(room);
    const shuffled = [...WORD_DASH_BANK].sort(() => 0.5 - Math.random());
    this.words = shuffled.slice(0, 5);
    this.totalRounds = this.words.length;
  }

  public start(): void {
    this.nextRound();
  }

  private nextRound(): void {
    this.currentWordIndex++;
    if (this.currentWordIndex >= this.words.length) {
      this.finishGame();
      return;
    }

    this.round = this.currentWordIndex + 1;
    this.solvedPlayers.clear();
    this.fastestSolver = null;
    this.roundScoresEarned = {};
    this.phase = 'PLAYING';
    this.deadline = Date.now() + 20000; // 20s round
    this.roundStartTime = Date.now();

    const w = this.words[this.currentWordIndex];
    this.room.sendSystemMessage(`⚡ Word Dash ${this.round}/${this.totalRounds}: Unscramble "${w.scrambled}"!`);
    this.room.broadcastState();
  }

  public handleAction(
    playerId: string,
    action: { type: string; payload: any }
  ): { success: boolean; error?: string } {
    if (this.isDisposed) return { success: false, error: 'Game concluded' };
    if (this.phase !== 'PLAYING') return { success: false, error: 'Not in solving phase' };

    if (action.type === 'submit_word') {
      if (this.solvedPlayers.has(playerId)) {
        return { success: false, error: 'Word already solved' };
      }

      const guess = (action.payload?.word || '').trim().toUpperCase();
      const currentWord = this.words[this.currentWordIndex];

      if (guess === currentWord.answer.toUpperCase()) {
        const timeTaken = Math.max(100, Date.now() - this.roundStartTime);
        const isFirst = this.solvedPlayers.size === 0;

        // Speed-based scoring: 500 pts base + up to 500 pts speed bonus
        const remainingTimeSec = Math.max(0, (this.deadline! - Date.now()) / 1000);
        const speedMultiplier = remainingTimeSec / 20; // 0 to 1
        const speedBonus = Math.round(500 * speedMultiplier);
        const totalPoints = (isFirst ? 600 : 400) + speedBonus;

        this.solvedPlayers.set(playerId, { solveTimeMs: timeTaken, points: totalPoints });
        this.scores[playerId] = (this.scores[playerId] || 0) + totalPoints;
        this.roundScoresEarned[playerId] = totalPoints;

        const player = this.room.players.get(playerId);
        const nickname = player?.nickname || 'Player';

        if (isFirst) {
          this.fastestSolver = { nickname, timeMs: timeTaken };
          this.room.sendSystemMessage(`⚡ ${nickname} solved it FIRST in ${(timeTaken / 1000).toFixed(1)}s! (+${totalPoints} pts)`);
        } else {
          this.room.sendSystemMessage(`✅ ${nickname} unscrambled the word! (+${totalPoints} pts)`);
        }

        // Check if all online players have solved
        const onlineCount = Array.from(this.room.players.values()).filter(p => p.isOnline).length;
        if (this.solvedPlayers.size >= onlineCount) {
          this.endRound();
        } else {
          this.room.broadcastState();
        }

        return { success: true };
      } else {
        return { success: false, error: 'Incorrect unscramble. Keep trying!' };
      }
    }

    return { success: false, error: 'Unknown action' };
  }

  private endRound(): void {
    if (this.phase === 'ROUND_END' || this.phase === 'RESULTS') return;
    this.phase = 'ROUND_END';
    this.deadline = Date.now() + 4500; // 4.5s round reveal

    const w = this.words[this.currentWordIndex];
    this.room.sendSystemMessage(`🏆 Word Dash Reveal: The word was "${w.answer}"!`);
    this.room.broadcastState();
  }

  public tick(now: number): void {
    if (this.isDisposed) return;

    if (this.phase === 'PLAYING') {
      // Simulate bots solving
      const bots = Array.from(this.room.players.values()).filter(p => p.isBot && p.isOnline);
      for (const bot of bots) {
        if (!this.solvedPlayers.has(bot.id) && now > this.roundStartTime + 4000) {
          if (Math.random() < 0.12) {
            const w = this.words[this.currentWordIndex];
            this.handleAction(bot.id, { type: 'submit_word', payload: { word: w.answer } });
          }
        }
      }

      if (this.deadline && now >= this.deadline) {
        this.endRound();
      }
    } else if (this.phase === 'ROUND_END') {
      if (this.deadline && now >= this.deadline) {
        this.nextRound();
      }
    }
  }

  public getPublicState(): WordDashPublicState {
    const currentWord = this.words[this.currentWordIndex];
    const isReveal = this.phase === 'ROUND_END' || this.phase === 'RESULTS';

    return {
      gameId: 'word-dash',
      phase: this.phase,
      round: this.round,
      totalRounds: this.totalRounds,
      deadline: this.deadline,
      timeRemainingMs: this.deadline ? Math.max(0, this.deadline - Date.now()) : 0,
      scores: this.scores,
      leaderboard: this.getLeaderboard(),
      currentWord: currentWord
        ? {
            id: currentWord.id,
            scrambled: currentWord.scrambled,
            category: currentWord.category,
            clue: currentWord.clue,
            wordLength: currentWord.answer.length,
          }
        : null,
      solvedPlayerIds: Array.from(this.solvedPlayers.keys()),
      roundReveal: isReveal && currentWord
        ? {
            answer: currentWord.answer,
            fastestPlayerNickname: this.fastestSolver?.nickname,
            fastestTimeMs: this.fastestSolver?.timeMs,
            scoresEarned: this.roundScoresEarned,
          }
        : null,
    };
  }

  public getPrivateState(playerId: string): WordDashPrivateState {
    const record = this.solvedPlayers.get(playerId);
    return {
      hasSolved: Boolean(record),
      mySolveTimeMs: record?.solveTimeMs,
      myPointsEarned: record?.points,
    };
  }
}
