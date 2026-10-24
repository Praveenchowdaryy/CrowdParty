import {
  GameLifecyclePhase,
  PlayerScoreSummary,
  GameResultPayload,
} from '@crowdparty/shared';
import { Room } from '../room/Room';

export abstract class BaseGame {
  public abstract readonly id: string;
  public room: Room;
  public phase: GameLifecyclePhase = 'WAITING_ROOM';
  public round: number = 0;
  public totalRounds: number = 1;
  public deadline: number | null = null;
  public scores: Record<string, number> = {};
  
  protected roundStartTime: number = 0;
  protected isDisposed: boolean = false;

  constructor(room: Room) {
    this.room = room;
    // Initialize scores for all active players
    for (const player of room.players.values()) {
      this.scores[player.id] = 0;
    }
  }

  public abstract start(): void;

  public abstract handleAction(
    playerId: string,
    action: { type: string; payload: any }
  ): { success: boolean; error?: string };

  public abstract tick(now: number): void;

  public abstract getPublicState(): any;

  public abstract getPrivateState(playerId: string): any;

  public handlePlayerLeave(playerId: string): void {
    // Default implementation: keep existing score, check if enough players remain
  }

  public getLeaderboard(): PlayerScoreSummary[] {
    const list: PlayerScoreSummary[] = [];
    for (const [playerId, score] of Object.entries(this.scores)) {
      const player = this.room.players.get(playerId);
      if (player) {
        list.push({
          playerId,
          nickname: player.nickname,
          avatar: player.avatar,
          score,
          delta: 0,
          rank: 1,
        });
      }
    }

    list.sort((a, b) => b.score - a.score);
    list.forEach((item, index) => {
      item.rank = index + 1;
      item.isWinner = index === 0 && item.score > 0;
    });

    return list;
  }

  protected finishGame(): void {
    this.phase = 'RESULTS';
    const standings = this.getLeaderboard();
    const highestScore = standings[0]?.score || 0;
    const winners = highestScore > 0 
      ? standings.filter(p => p.score === highestScore).map(p => p.playerId)
      : standings.map(p => p.playerId);

    const resultPayload: GameResultPayload = {
      gameId: this.id,
      winnerIds: winners,
      finalStandings: standings,
      statistics: {
        totalRounds: this.totalRounds,
        totalPlayers: this.room.players.size,
      },
      completedAt: Date.now(),
    };

    // Update global room player scores
    for (const standing of standings) {
      const player = this.room.players.get(standing.playerId);
      if (player) {
        player.score += standing.score;
      }
    }

    this.room.onGameFinished(resultPayload);
  }

  public dispose(): void {
    this.isDisposed = true;
    this.deadline = null;
  }
}
