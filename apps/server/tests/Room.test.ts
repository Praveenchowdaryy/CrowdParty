import { describe, it, expect, beforeEach } from 'vitest';
import { Room } from '../src/room/Room';

// Mock Socket
function createMockSocket() {
  return {
    connected: true,
    emit: () => {},
    join: () => {},
    leave: () => {},
  } as any;
}

describe('Room Model', () => {
  let room: Room;

  beforeEach(() => {
    room = new Room('TEST01', '');
  });

  it('assigns host status to first joining player', () => {
    const socket1 = createMockSocket();
    const { player: p1, sessionToken: tok1 } = room.addPlayer('Alice', 'cat', socket1);

    expect(p1.isHost).toBe(true);
    expect(room.hostId).toBe(p1.id);
    expect(tok1).toBeDefined();

    const socket2 = createMockSocket();
    const { player: p2 } = room.addPlayer('Bob', 'fox', socket2);
    expect(p2.isHost).toBe(false);
  });

  it('supports seamless player reconnection using session tokens', () => {
    const socket1 = createMockSocket();
    const { player, sessionToken } = room.addPlayer('Alice', 'cat', socket1);

    // Simulate disconnect
    room.removePlayer(player.id, 'Network drop');
    expect(room.players.get(player.id)?.isOnline).toBe(false);

    // Reconnect with same session token
    const newSocket = createMockSocket();
    const reconnectResult = room.addPlayer('AliceNew', 'cat', newSocket, sessionToken);

    expect(reconnectResult.player.id).toBe(player.id);
    expect(reconnectResult.player.isOnline).toBe(true);
  });

  it('elects a new host if active host leaves', () => {
    const socket1 = createMockSocket();
    const socket2 = createMockSocket();

    const { player: p1 } = room.addPlayer('Alice', 'cat', socket1);
    const { player: p2 } = room.addPlayer('Bob', 'fox', socket2);

    expect(room.hostId).toBe(p1.id);

    room.removePlayer(p1.id, 'Host departed');

    expect(room.hostId).toBe(p2.id);
    expect(p2.isHost).toBe(true);
  });

  it('enforces host-only permissions for game selection and starting', () => {
    const socket1 = createMockSocket();
    const socket2 = createMockSocket();

    const { player: p1 } = room.addPlayer('Alice', 'cat', socket1);
    const { player: p2 } = room.addPlayer('Bob', 'fox', socket2);

    // Non-host attempts to select game
    expect(() => room.selectGame(p2.id, 'quiz-battle')).toThrow('Only the host can select a game');

    // Host selects game
    room.selectGame(p1.id, 'quiz-battle');
    expect(room.selectedGameId).toBe('quiz-battle');

    // Non-host attempts to start game
    expect(() => room.startGame(p2.id)).toThrow('Only the host can start the game');
  });

  it('adds and removes simulated bots', () => {
    room.addPlayer('Alice', 'cat', createMockSocket());
    expect(room.players.size).toBe(1);

    room.addBot();
    expect(room.players.size).toBe(2);

    const bot = Array.from(room.players.values()).find(p => p.isBot);
    expect(bot).toBeDefined();
    expect(bot?.isReady).toBe(true);

    room.removeBot(bot!.id);
    expect(room.players.size).toBe(1);
  });

  it('allows host to start a rematch (Play Again) after game completes', () => {
    const socket1 = createMockSocket();
    const socket2 = createMockSocket();

    const { player: p1 } = room.addPlayer('Alice', 'cat', socket1);
    room.addPlayer('Bob', 'fox', socket2);

    room.selectGame(p1.id, 'quiz-battle');
    room.startGame(p1.id);

    expect(room.status).toBe('IN_GAME');
    expect(room.activeGame).toBeDefined();

    // Simulate round progression to results
    (room.activeGame as any).finishGame();
    expect(room.activeGame?.phase).toBe('RESULTS');

    // Host clicks Play Again (calls startGame again)
    expect(() => room.startGame(p1.id)).not.toThrow();
    expect(room.status).toBe('IN_GAME');
    expect(room.activeGame?.phase).toBe('PLAYING');
  });
});
