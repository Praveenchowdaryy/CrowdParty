import {
  DrawAndGuessPublicState,
  DrawAndGuessPrivateState,
  DrawStroke,
} from '@crowdparty/shared';
import { BaseGame } from '../BaseGame';
import { Room } from '../../room/Room';

const WORD_BANK = [
  'Rocket', 'Pizza', 'Penguin', 'Guitar', 'Laptop', 'Bicycle', 'Castle',
  'Rainbow', 'Dinosaur', 'Telescope', 'Volcano', 'Submarine', 'Helicopter',
  'Diamond', 'Coffee', 'Octopus', 'Compass', 'Microscope', 'Campfire',
  'Snowman', 'Rollercoaster', 'Moon', 'Elephant', 'Treehouse', 'Dragon',
  'Sailboat', 'Pyramid', 'Headphones', 'Camera', 'Cactus', 'Spaceship',
  'Sunglasses', 'Anchor', 'Crown', 'Hot Air Balloon', 'Basketball', 'Keyboard'
];

export class DrawAndGuessGame extends BaseGame {
  public readonly id = 'draw-and-guess';
  public drawerId: string = '';
  public secretWord: string = '';
  public wordChoices: string[] = [];
  public isSelectingWord: boolean = true;
  public guessedPlayerIds: Set<string> = new Set();
  public strokes: DrawStroke[] = [];
  public hintMask: string = '';
  public roundScoresEarned: Record<string, number> = {};

  private playerOrder: string[] = [];
  private currentDrawerIndex: number = -1;
  private revealedCharIndices: Set<number> = new Set();

  constructor(room: Room) {
    super(room);
    this.playerOrder = Array.from(room.players.keys());
    this.totalRounds = Math.max(1, this.playerOrder.length);
  }

  public start(): void {
    this.phase = 'STARTING';
    this.nextTurn();
  }

  private nextTurn(): void {
    this.currentDrawerIndex++;
    if (this.currentDrawerIndex >= this.playerOrder.length) {
      this.finishGame();
      return;
    }

    this.drawerId = this.playerOrder[this.currentDrawerIndex];
    // Check if player still exists
    if (!this.room.players.has(this.drawerId)) {
      this.nextTurn();
      return;
    }

    this.round = this.currentDrawerIndex + 1;
    this.strokes = [];
    this.guessedPlayerIds.clear();
    this.revealedCharIndices.clear();
    this.roundScoresEarned = {};

    // Select 3 random distinct words
    const shuffled = [...WORD_BANK].sort(() => 0.5 - Math.random());
    this.wordChoices = shuffled.slice(0, 3);
    this.secretWord = '';
    this.isSelectingWord = true;
    this.phase = 'STARTING';
    // 15 seconds to select a word, auto-select first word if timeout
    this.deadline = Date.now() + 15000;
    this.roundStartTime = Date.now();

    const drawer = this.room.players.get(this.drawerId);
    this.room.sendSystemMessage(`🎨 Round ${this.round}/${this.totalRounds}: ${drawer?.nickname || 'A player'} is picking a word!`);
    this.room.broadcastState();
  }

  public selectWord(word: string): void {
    this.secretWord = word.trim().toUpperCase();
    this.isSelectingWord = false;
    this.phase = 'PLAYING';
    // 70 seconds to draw and guess
    this.deadline = Date.now() + 70000;
    this.roundStartTime = Date.now();
    this.buildHintMask();

    const drawer = this.room.players.get(this.drawerId);
    this.room.sendSystemMessage(`✏️ ${drawer?.nickname} selected a word! Start guessing in chat!`);
    this.room.broadcastState();
  }

  private buildHintMask(): void {
    if (!this.secretWord) {
      this.hintMask = '';
      return;
    }

    const chars = this.secretWord.split('');
    const mask = chars.map((char, index) => {
      if (char === ' ') return '  ';
      if (this.revealedCharIndices.has(index)) return char;
      return '_';
    });

    this.hintMask = mask.join(' ');
  }

  private revealNextHintLetter(): void {
    if (!this.secretWord) return;
    const unrevealed: number[] = [];
    for (let i = 0; i < this.secretWord.length; i++) {
      if (this.secretWord[i] !== ' ' && !this.revealedCharIndices.has(i)) {
        unrevealed.push(i);
      }
    }

    // Keep at least 40% hidden
    const maxRevealed = Math.floor(this.secretWord.replace(/\s+/g, '').length * 0.5);
    if (unrevealed.length > 0 && this.revealedCharIndices.size < maxRevealed) {
      const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      this.revealedCharIndices.add(pick);
      this.buildHintMask();
      this.room.broadcastState();
    }
  }

  public handleAction(
    playerId: string,
    action: { type: string; payload: any }
  ): { success: boolean; error?: string } {
    if (this.isDisposed) return { success: false, error: 'Game finished' };

    if (action.type === 'choose_word') {
      if (playerId !== this.drawerId) {
        return { success: false, error: 'Only the active drawer can pick a word' };
      }
      if (!this.isSelectingWord) {
        return { success: false, error: 'Word already selected' };
      }
      const choice = action.payload?.word;
      if (!choice || !this.wordChoices.includes(choice)) {
        return { success: false, error: 'Invalid word choice' };
      }
      this.selectWord(choice);
      return { success: true };
    }

    if (action.type === 'draw_stroke') {
      if (playerId !== this.drawerId) {
        return { success: false, error: 'Only the active drawer can draw' };
      }
      if (this.phase !== 'PLAYING') {
        return { success: false, error: 'Not in drawing phase' };
      }
      const stroke: DrawStroke = action.payload;
      this.strokes.push(stroke);
      // Broadcast stroke immediately to all room members
      this.room.broadcastStroke(stroke);
      return { success: true };
    }

    if (action.type === 'clear_canvas') {
      if (playerId !== this.drawerId) {
        return { success: false, error: 'Only the active drawer can clear canvas' };
      }
      this.strokes = [];
      this.room.broadcastClearCanvas();
      return { success: true };
    }

    if (action.type === 'guess') {
      const text = action.payload?.text?.trim();
      if (!text) return { success: false, error: 'Empty guess' };
      return this.checkGuess(playerId, text);
    }

    return { success: false, error: 'Unknown action' };
  }

  public checkGuess(playerId: string, guessText: string): { success: boolean; error?: string } {
    if (this.phase !== 'PLAYING' || !this.secretWord) {
      return { success: false, error: 'Guessing not currently active' };
    }

    if (playerId === this.drawerId) {
      return { success: false, error: "Drawer can't guess their own word" };
    }

    if (this.guessedPlayerIds.has(playerId)) {
      return { success: false, error: 'You have already guessed the word' };
    }

    const cleanGuess = guessText.trim().toUpperCase();
    const cleanSecret = this.secretWord.trim().toUpperCase();

    if (cleanGuess === cleanSecret) {
      this.guessedPlayerIds.add(playerId);

      // Score calculation: based on remaining time
      const timeRemaining = Math.max(0, (this.deadline || 0) - Date.now());
      const speedBonus = Math.floor((timeRemaining / 70000) * 300);
      const points = 250 + speedBonus; // 250 - 550 points

      this.scores[playerId] = (this.scores[playerId] || 0) + points;
      this.roundScoresEarned[playerId] = points;

      // Drawer also receives 120 points per successful guesser
      this.scores[this.drawerId] = (this.scores[this.drawerId] || 0) + 120;
      this.roundScoresEarned[this.drawerId] = (this.roundScoresEarned[this.drawerId] || 0) + 120;

      const guesser = this.room.players.get(playerId);
      this.room.sendSystemMessage(`🎉 ${guesser?.nickname} guessed the secret word! (+${points} pts)`);

      // Check if all non-drawers have guessed
      const nonDrawers = Array.from(this.room.players.keys()).filter(id => id !== this.drawerId);
      if (this.guessedPlayerIds.size >= nonDrawers.length && nonDrawers.length > 0) {
        this.room.sendSystemMessage('🏆 Everyone guessed the word!');
        this.endRound();
      } else {
        this.room.broadcastState();
      }

      return { success: true };
    }

    return { success: false, error: 'Incorrect guess' };
  }

  private endRound(): void {
    this.phase = 'ROUND_END';
    // 6 seconds to view the reveal
    this.deadline = Date.now() + 6000;

    const drawer = this.room.players.get(this.drawerId);
    this.room.sendSystemMessage(`⏰ Round over! The word was: "${this.secretWord}"`);
    this.room.broadcastState();
  }

  public tick(now: number): void {
    if (this.isDisposed) return;

    if (this.deadline && now >= this.deadline) {
      if (this.phase === 'STARTING' && this.isSelectingWord) {
        // Auto-select first word if drawer didn't choose
        const word = this.wordChoices[0] || 'STAR';
        this.selectWord(word);
      } else if (this.phase === 'PLAYING') {
        this.endRound();
      } else if (this.phase === 'ROUND_END') {
        this.nextTurn();
      }
      return;
    }

    // Hint letter reveals during play phase
    if (this.phase === 'PLAYING' && this.deadline) {
      const elapsed = now - this.roundStartTime;
      const totalDuration = this.deadline - this.roundStartTime;
      const progress = elapsed / totalDuration;

      // At 40% and 70% elapsed time, reveal a letter
      if (progress >= 0.4 && this.revealedCharIndices.size === 0) {
        this.revealNextHintLetter();
      } else if (progress >= 0.7 && this.revealedCharIndices.size === 1) {
        this.revealNextHintLetter();
      }
    }
  }

  public getPublicState(): DrawAndGuessPublicState {
    const drawer = this.room.players.get(this.drawerId);
    const now = Date.now();
    const timeRemainingMs = this.deadline ? Math.max(0, this.deadline - now) : 0;

    return {
      gameId: 'draw-and-guess',
      phase: this.phase,
      round: this.round,
      totalRounds: this.totalRounds,
      deadline: this.deadline,
      timeRemainingMs,
      scores: { ...this.scores },
      leaderboard: this.getLeaderboard(),
      drawerId: this.drawerId,
      drawerNickname: drawer?.nickname || 'Unknown Drawer',
      wordLength: this.secretWord ? this.secretWord.replace(/\s+/g, '').length : 0,
      hintMask: this.hintMask,
      guessedPlayerIds: Array.from(this.guessedPlayerIds),
      strokes: this.strokes,
      isSelectingWord: this.isSelectingWord,
      roundReveal: this.phase === 'ROUND_END' || this.phase === 'RESULTS' ? {
        secretWord: this.secretWord,
        scoresEarned: this.roundScoresEarned,
      } : undefined,
    };
  }

  public getPrivateState(playerId: string): DrawAndGuessPrivateState {
    const isDrawer = playerId === this.drawerId;
    return {
      isDrawer,
      secretWord: isDrawer ? this.secretWord : undefined,
      wordChoices: isDrawer && this.isSelectingWord ? this.wordChoices : undefined,
      hasGuessed: this.guessedPlayerIds.has(playerId),
    };
  }
}
