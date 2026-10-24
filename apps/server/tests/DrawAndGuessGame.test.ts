import { describe, it, expect, beforeEach } from 'vitest';
import { Room } from '../src/room/Room';
import { DrawAndGuessGame } from '../src/engine/games/DrawAndGuessGame';

function createMockSocket() {
  return { connected: true, emit: () => {}, join: () => {}, leave: () => {} } as any;
}

describe('Draw & Guess Game Engine', () => {
  let room: Room;
  let game: DrawAndGuessGame;
  let drawerId: string;
  let guesserId: string;

  beforeEach(() => {
    room = new Room('DRAW01', '');
    const { player: p1 } = room.addPlayer('Picasso', 'cat', createMockSocket());
    const { player: p2 } = room.addPlayer('Sherlock', 'fox', createMockSocket());
    drawerId = p1.id;
    guesserId = p2.id;

    game = new DrawAndGuessGame(room);
    game.start();
  });

  it('initializes round and generates word choices for drawer', () => {
    const pub = game.getPublicState();
    expect(pub.isSelectingWord).toBe(true);
    expect(pub.drawerId).toBe(drawerId);

    const drawerPriv = game.getPrivateState(drawerId);
    expect(drawerPriv.isDrawer).toBe(true);
    expect(drawerPriv.wordChoices?.length).toBeGreaterThan(0);

    const guesserPriv = game.getPrivateState(guesserId);
    expect(guesserPriv.isDrawer).toBe(false);
    expect(guesserPriv.wordChoices).toBeUndefined();
    expect(guesserPriv.secretWord).toBeUndefined();
  });

  it('transitions to playing phase when drawer picks a word', () => {
    const drawerPriv = game.getPrivateState(drawerId);
    const word = drawerPriv.wordChoices![0];

    const res = game.handleAction(drawerId, {
      type: 'choose_word',
      payload: { word },
    });

    expect(res.success).toBe(true);
    expect(game.phase).toBe('PLAYING');
    expect(game.isSelectingWord).toBe(false);

    // Verify secret word is hidden in public state
    const pub = game.getPublicState();
    expect(pub.hintMask).toBeDefined();
    expect(pub.hintMask).toContain('_');
  });

  it('awards points when guesser submits correct word', () => {
    const drawerPriv = game.getPrivateState(drawerId);
    const word = drawerPriv.wordChoices![0];
    game.handleAction(drawerId, { type: 'choose_word', payload: { word } });

    // Wrong guess
    const wrongRes = game.checkGuess(guesserId, 'WRONG_WORD');
    expect(wrongRes.success).toBe(false);
    expect(game.scores[guesserId] || 0).toBe(0);

    // Correct guess (case-insensitive)
    const correctRes = game.checkGuess(guesserId, word.toLowerCase());
    expect(correctRes.success).toBe(true);
    expect(game.scores[guesserId]).toBeGreaterThan(200);
    expect(game.scores[drawerId]).toBeGreaterThan(0); // Drawer participation reward
  });

  it('rejects drawing strokes from non-drawer', () => {
    const res = game.handleAction(guesserId, {
      type: 'draw_stroke',
      payload: { id: 's1', points: [{ x: 0.1, y: 0.1 }], color: '#FFF', size: 4, isEraser: false },
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe('Only the active drawer can draw');
  });
});
