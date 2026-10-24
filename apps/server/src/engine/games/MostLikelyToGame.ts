import {
  MostLikelyToPublicState,
  MostLikelyToPrivateState,
  MostLikelyToPrompt,
} from '@crowdparty/shared';
import { BaseGame } from '../BaseGame';
import { Room } from '../../room/Room';

const MOST_LIKELY_TO_BANK: MostLikelyToPrompt[] = [
  {
    id: 'mlt-1',
    category: 'Squad Dynamics',
    prompt: 'Who is most likely to have 50+ browser tabs open right now?',
  },
  {
    id: 'mlt-2',
    category: 'Survival Skills',
    prompt: 'Who is most likely to survive a zombie apocalypse through sheer luck?',
  },
  {
    id: 'mlt-3',
    category: 'Work Culture',
    prompt: 'Who is most likely to deploy code on a Friday afternoon and vanish for the weekend?',
  },
  {
    id: 'mlt-4',
    category: 'Daily Habits',
    prompt: 'Who is most likely to order takeout 5 days in a single week?',
  },
  {
    id: 'mlt-5',
    category: 'Fame & Chaos',
    prompt: 'Who is most likely to accidentally become a viral meme on social media?',
  },
  {
    id: 'mlt-6',
    category: 'Tech Bloopers',
    prompt: 'Who is most likely to join a video call with their camera on while in pajamas?',
  },
  {
    id: 'mlt-7',
    category: 'Adventures',
    prompt: 'Who is most likely to pack an entire suitcase for a 2-day weekend trip?',
  },
];

export class MostLikelyToGame extends BaseGame {
  public readonly id = 'most-likely-to';
  private prompts: MostLikelyToPrompt[] = [];
  private currentPromptIndex: number = -1;
  private playerVotes: Map<string, string> = new Map(); // voterId -> targetPlayerId
  private roundRevealData: any = null;

  constructor(room: Room) {
    super(room);
    const shuffled = [...MOST_LIKELY_TO_BANK].sort(() => 0.5 - Math.random());
    this.prompts = shuffled.slice(0, 5);
    this.totalRounds = this.prompts.length;
  }

  public start(): void {
    this.nextRound();
  }

  private nextRound(): void {
    this.currentPromptIndex++;
    if (this.currentPromptIndex >= this.prompts.length) {
      this.finishGame();
      return;
    }

    this.round = this.currentPromptIndex + 1;
    this.playerVotes.clear();
    this.roundRevealData = null;
    this.phase = 'PLAYING';
    this.deadline = Date.now() + 20000; // 20s to vote
    this.roundStartTime = Date.now();

    const p = this.prompts[this.currentPromptIndex];
    this.room.sendSystemMessage(`👑 Most Likely To: "${p.prompt}"`);
    this.room.broadcastState();
  }

  public handleAction(
    playerId: string,
    action: { type: string; payload: any }
  ): { success: boolean; error?: string } {
    if (this.isDisposed) return { success: false, error: 'Game concluded' };
    if (this.phase !== 'PLAYING') return { success: false, error: 'Not in voting phase' };

    if (action.type === 'vote_player') {
      const targetId = action.payload?.targetPlayerId;
      if (!targetId || !this.room.players.has(targetId)) {
        return { success: false, error: 'Invalid candidate player' };
      }

      this.playerVotes.set(playerId, targetId);

      const onlineCount = Array.from(this.room.players.values()).filter(p => p.isOnline).length;
      if (this.playerVotes.size >= onlineCount) {
        this.endRound();
      } else {
        this.room.broadcastState();
      }

      return { success: true };
    }

    return { success: false, error: 'Unknown action' };
  }

  private endRound(): void {
    if (this.phase === 'ROUND_END' || this.phase === 'RESULTS') return;
    this.phase = 'ROUND_END';
    this.deadline = Date.now() + 5000; // 5s reveal

    // Tally votes
    const voteCounts: Record<string, number> = {};
    const votesByPlayer: Record<string, string[]> = {};

    for (const [voterId, targetId] of this.playerVotes.entries()) {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
      const voter = this.room.players.get(voterId);
      if (voter) {
        if (!votesByPlayer[targetId]) votesByPlayer[targetId] = [];
        votesByPlayer[targetId].push(voter.nickname);
      }
    }

    // Determine winner
    let maxVotes = 0;
    let winnerId = '';

    for (const [targetId, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        winnerId = targetId;
      }
    }

    const winner = this.room.players.get(winnerId);
    const scoresEarned: Record<string, number> = {};

    if (winner) {
      // Award 500 pts to the crowned person!
      this.scores[winner.id] = (this.scores[winner.id] || 0) + 500;
      scoresEarned[winner.id] = 500;

      // Award 200 pts to everyone who voted with the majority
      for (const [voterId, targetId] of this.playerVotes.entries()) {
        if (targetId === winner.id) {
          this.scores[voterId] = (this.scores[voterId] || 0) + 200;
          scoresEarned[voterId] = (scoresEarned[voterId] || 0) + 200;
        }
      }

      this.room.sendSystemMessage(`👑 ${winner.nickname} was voted MOST LIKELY TO with ${maxVotes} votes! (+500 pts)`);
    }

    this.roundRevealData = {
      winnerId: winner?.id || '',
      winnerNickname: winner?.nickname || 'Squad Member',
      winnerAvatar: winner?.avatar || 'cat',
      voteCount: maxVotes,
      votesByPlayer,
      scoresEarned,
    };

    this.room.broadcastState();
  }

  public tick(now: number): void {
    if (this.isDisposed) return;

    if (this.phase === 'PLAYING') {
      // Simulate bots voting
      const bots = Array.from(this.room.players.values()).filter(p => p.isBot && p.isOnline);
      for (const bot of bots) {
        if (!this.playerVotes.has(bot.id) && now > this.roundStartTime + 3000) {
          const players = Array.from(this.room.players.values()).filter(p => p.isOnline);
          if (players.length > 0 && Math.random() < 0.15) {
            const randomTarget = players[Math.floor(Math.random() * players.length)];
            this.handleAction(bot.id, { type: 'vote_player', payload: { targetPlayerId: randomTarget.id } });
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

  public getPublicState(): MostLikelyToPublicState {
    const currentPrompt = this.prompts[this.currentPromptIndex];

    return {
      gameId: 'most-likely-to',
      phase: this.phase,
      round: this.round,
      totalRounds: this.totalRounds,
      deadline: this.deadline,
      timeRemainingMs: this.deadline ? Math.max(0, this.deadline - Date.now()) : 0,
      scores: this.scores,
      leaderboard: this.getLeaderboard(),
      currentPrompt: currentPrompt
        ? {
            id: currentPrompt.id,
            prompt: currentPrompt.prompt,
            category: currentPrompt.category,
          }
        : null,
      votedPlayerIds: Array.from(this.playerVotes.keys()),
      roundReveal: this.roundRevealData,
    };
  }

  public getPrivateState(playerId: string): MostLikelyToPrivateState {
    return {
      hasVoted: this.playerVotes.has(playerId),
      myVotePlayerId: this.playerVotes.get(playerId),
    };
  }
}
