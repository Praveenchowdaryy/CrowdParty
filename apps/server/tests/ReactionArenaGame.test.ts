import { describe, it, expect, beforeEach } from 'vitest';
import { Room } from '../src/room/Room';
import { ReactionArenaGame } from '../src/engine/games/ReactionArenaGame';

function createMockSocket() {
  return { connected: true, emit: () => {}, join: () => {}, leave: () => {} } as any;
}

describe('Reaction Arena Game Engine', () => {
  let room: Room;
  let game: ReactionArenaGame;
  let p1Id: string;
  let p2Id: string;

  beforeEach(() => {
    room = new Room('REACT1', '');
    const { player: p1 } = room.addPlayer('Flash', 'rocket', createMockSocket());
    const { player: p2 } = room.addPlayer('Sonic', 'ninja', createMockSocket());
    p1Id = p1.id;
    p2Id = p2.id;

    game = new ReactionArenaGame(room);
    game.start();
  });

  it('starts in WAITING_SIGNAL state with delayed randomized signal', () => {
    const pub = game.getPublicState();
    expect(pub.arenaStatus).toBe('WAITING_SIGNAL');
    expect(pub.signalTriggeredAt).toBeNull();
  });

  it('detects false start if player reacts before green signal', () => {
    const res = game.handleAction(p1Id, {
      type: 'react',
      payload: {},
    });

    expect(res.success).toBe(true);
    const priv = game.getPrivateState(p1Id);
    expect(priv.hasReacted).toBe(true);
    expect(priv.isFalseStart).toBe(true);
    expect(priv.myReactionTimeMs).toBeNull();
  });

  it('calculates valid reaction time and ranks players after signal trigger', () => {
    // Manually trigger signal by ticking past scheduled time
    game.tick(game.signalScheduledTime + 50);

    const pub = game.getPublicState();
    expect(pub.arenaStatus).toBe('SIGNAL_ACTIVE');
    expect(pub.signalTriggeredAt).toBeDefined();

    // Valid reaction
    const res = game.handleAction(p2Id, { type: 'react', payload: {} });
    expect(res.success).toBe(true);

    const priv = game.getPrivateState(p2Id);
    expect(priv.isFalseStart).toBe(false);
    expect(priv.myReactionTimeMs).toBeGreaterThan(0);
  });
});
