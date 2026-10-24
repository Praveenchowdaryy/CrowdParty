import {
  ReactionArenaPublicState,
  ReactionArenaPrivateState,
  ArenaStatus,
  ReactionPlayerResult,
} from '@crowdparty/shared';
import { BaseGame } from '../BaseGame';
import { Room } from '../../room/Room';

export class ReactionArenaGame extends BaseGame {
  public readonly id = 'reaction-arena';
  public arenaStatus: ArenaStatus = 'WAITING_TO_START';
  public signalTriggeredAt: number | null = null;
  public signalScheduledTime: number = 0;
  
  private playerReactions: Map<string, { reactionTimeMs: number | null; isFalseStart: boolean; timestamp: number }> = new Map();
  private roundScoresEarned: Record<string, number> = {};

  constructor(room: Room) {
    super(room);
    this.totalRounds = 3;
  }

  public start(): void {
    this.nextRound();
  }

  private nextRound(): void {
    this.round++;
    if (this.round > this.totalRounds) {
      this.finishGame();
      return;
    }

    this.playerReactions.clear();
    this.roundScoresEarned = {};
    this.signalTriggeredAt = null;
    this.phase = 'PLAYING';
    this.arenaStatus = 'WAITING_SIGNAL';

    // Random signal delay between 2500ms and 6500ms
    const randomDelay = Math.floor(Math.random() * 4000) + 2500;
    this.signalScheduledTime = Date.now() + randomDelay;
    
    // Overall round timeout: 5000ms after green signal
    this.deadline = this.signalScheduledTime + 5000;

    this.room.sendSystemMessage(`⚡ Round ${this.round}/${this.totalRounds}: Get ready! React when the arena turns GREEN!`);
    this.room.broadcastState();
  }

  public handleAction(
    playerId: string,
    action: { type: string; payload: any }
  ): { success: boolean; error?: string } {
    if (this.isDisposed) return { success: false, error: 'Game finished' };

    if (action.type === 'react') {
      if (this.phase !== 'PLAYING') {
        return { success: false, error: 'Round not active' };
      }

      if (this.playerReactions.has(playerId)) {
        return { success: false, error: 'Already reacted this round' };
      }

      const now = Date.now();

      // Check for false start
      if (this.arenaStatus !== 'SIGNAL_ACTIVE' || !this.signalTriggeredAt) {
        this.playerReactions.set(playerId, {
          reactionTimeMs: null,
          isFalseStart: true,
          timestamp: now,
        });

        const player = this.room.players.get(playerId);
        this.room.sendSystemMessage(`⚠️ ${player?.nickname} FALSE START! Jumped the gun.`);
        this.checkAllPlayersReacted();
        this.room.broadcastState();
        return { success: true };
      }

      // Valid reaction after signal
      const authoritativeReactionMs = Math.max(1, now >= this.signalTriggeredAt ? now - this.signalTriggeredAt : 120);
      this.playerReactions.set(playerId, {
        reactionTimeMs: authoritativeReactionMs,
        isFalseStart: false,
        timestamp: now,
      });

      this.checkAllPlayersReacted();
      this.room.broadcastState();
      return { success: true };
    }

    return { success: false, error: 'Unknown action' };
  }

  private checkAllPlayersReacted(): void {
    const activePlayerCount = Array.from(this.room.players.values()).filter(p => p.isOnline).length;
    if (this.playerReactions.size >= activePlayerCount && activePlayerCount > 0) {
      this.endRound();
    }
  }

  private endRound(): void {
    this.arenaStatus = 'ROUND_RESULTS';
    this.phase = 'ROUND_END';
    // 5 seconds to review results
    this.deadline = Date.now() + 5000;

    // Rank players by reaction time (false starts ranked last)
    const validResults: { playerId: string; time: number }[] = [];
    const falseStarts: string[] = [];

    for (const [playerId, reaction] of this.playerReactions.entries()) {
      if (reaction.isFalseStart || reaction.reactionTimeMs === null) {
        falseStarts.push(playerId);
      } else {
        validResults.push({ playerId, time: reaction.reactionTimeMs });
      }
    }

    validResults.sort((a, b) => a.time - b.time);

    // Award points
    const pointScale = [500, 350, 250, 150, 100];
    validResults.forEach((res, index) => {
      const pts = pointScale[index] || 80;
      this.scores[res.playerId] = (this.scores[res.playerId] || 0) + pts;
      this.roundScoresEarned[res.playerId] = pts;
    });

    for (const fsPlayerId of falseStarts) {
      this.roundScoresEarned[fsPlayerId] = 0;
    }

    this.room.broadcastState();
  }

  public tick(now: number): void {
    if (this.isDisposed) return;

    // Check if green signal should fire
    if (this.arenaStatus === 'WAITING_SIGNAL' && now >= this.signalScheduledTime) {
      this.arenaStatus = 'SIGNAL_ACTIVE';
      this.signalTriggeredAt = now;
      this.room.broadcastState();
      return;
    }

    // Check deadline for round end
    if (this.deadline && now >= this.deadline) {
      if (this.phase === 'PLAYING') {
        this.endRound();
      } else if (this.phase === 'ROUND_END') {
        this.nextRound();
      }
    }
  }

  private getReactionResults(): ReactionPlayerResult[] {
    const list: ReactionPlayerResult[] = [];
    for (const player of this.room.players.values()) {
      const rec = this.playerReactions.get(player.id);
      list.push({
        playerId: player.id,
        nickname: player.nickname,
        avatar: player.avatar,
        reactionTimeMs: rec?.reactionTimeMs ?? null,
        isFalseStart: !!rec?.isFalseStart,
        scoreEarned: this.roundScoresEarned[player.id] || 0,
        rank: 999,
      });
    }

    list.sort((a, b) => {
      if (a.isFalseStart && !b.isFalseStart) return 1;
      if (!a.isFalseStart && b.isFalseStart) return -1;
      if (a.reactionTimeMs !== null && b.reactionTimeMs !== null) {
        return a.reactionTimeMs - b.reactionTimeMs;
      }
      if (a.reactionTimeMs !== null) return -1;
      return 1;
    });

    list.forEach((item, index) => {
      item.rank = index + 1;
    });

    return list;
  }

  public getPublicState(): ReactionArenaPublicState {
    const now = Date.now();
    const timeRemainingMs = this.deadline ? Math.max(0, this.deadline - now) : 0;

    return {
      gameId: 'reaction-arena',
      phase: this.phase,
      round: this.round,
      totalRounds: this.totalRounds,
      deadline: this.deadline,
      timeRemainingMs,
      scores: { ...this.scores },
      leaderboard: this.getLeaderboard(),
      arenaStatus: this.arenaStatus,
      signalTriggeredAt: this.signalTriggeredAt,
      results: this.getReactionResults(),
      reactedPlayerIds: Array.from(this.playerReactions.keys()),
    };
  }

  public getPrivateState(playerId: string): ReactionArenaPrivateState {
    const rec = this.playerReactions.get(playerId);
    return {
      hasReacted: !!rec,
      myReactionTimeMs: rec?.reactionTimeMs,
      isFalseStart: rec?.isFalseStart,
    };
  }
}
