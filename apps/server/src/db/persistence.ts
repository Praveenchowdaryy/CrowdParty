import { GameResultPayload } from '@crowdparty/shared';

export interface PersistentGameSession {
  roomCode: string;
  gameId: string;
  totalRounds: number;
  winnerIds: string[];
  finalStandings: any;
  statistics: any;
  completedAt: Date;
}

export class PersistenceService {
  private static instance: PersistenceService;
  private hasSupabase: boolean = false;
  private inMemoryHistory: PersistentGameSession[] = [];

  private constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      this.hasSupabase = true;
      console.log('✅ Supabase persistence enabled');
    } else {
      console.log('ℹ️ Running in-memory persistence mode (Supabase credentials not configured)');
    }
  }

  public static getInstance(): PersistenceService {
    if (!PersistenceService.instance) {
      PersistenceService.instance = new PersistenceService();
    }
    return PersistenceService.instance;
  }

  public async recordGameSession(
    roomCode: string,
    results: GameResultPayload
  ): Promise<void> {
    const session: PersistentGameSession = {
      roomCode,
      gameId: results.gameId,
      totalRounds: Number(results.statistics?.totalRounds) || 1,
      winnerIds: results.winnerIds,
      finalStandings: results.finalStandings,
      statistics: results.statistics,
      completedAt: new Date(results.completedAt),
    };

    this.inMemoryHistory.push(session);

    if (this.hasSupabase) {
      try {
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/game_sessions`, {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            room_code: session.roomCode,
            game_id: session.gameId,
            total_rounds: session.totalRounds,
            winner_ids: session.winnerIds,
            final_standings: session.finalStandings,
            statistics: session.statistics,
            completed_at: session.completedAt.toISOString(),
          }),
        });

        if (!response.ok) {
          console.warn('Failed to insert game session into Supabase:', await response.text());
        }
      } catch (err) {
        console.warn('Supabase request error:', err);
      }
    }
  }

  public getHistory(): PersistentGameSession[] {
    return [...this.inMemoryHistory];
  }
}
