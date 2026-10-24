import { describe, it, expect, beforeEach } from 'vitest';
import { Room } from '../src/room/Room';
import { HotTakesGame } from '../src/engine/games/HotTakesGame';

function createMockSocket() {
  return { connected: true, emit: () => {}, join: () => {}, leave: () => {} } as any;
}

describe('Hot Takes Game Engine', () => {
  let room: Room;
  let game: HotTakesGame;
  let p1Id: string;
  let p2Id: string;
  let p3Id: string;

  beforeEach(() => {
    room = new Room('TAKE01', '');
    const { player: p1 } = room.addPlayer('Dave', 'rabbit', createMockSocket());
    const { player: p2 } = room.addPlayer('Emma', 'alien', createMockSocket());
    const { player: p3 } = room.addPlayer('Frank', 'wizard', createMockSocket());
    p1Id = p1.id;
    p2Id = p2.id;
    p3Id = p3.id;

    game = new HotTakesGame(room);
    game.start();
  });

  it('serves dilemma prompt and hides votes until reveal', () => {
    const pub = game.getPublicState();
    expect(pub.currentPrompt).toBeDefined();
    expect(pub.currentPrompt?.optionA).toBeDefined();
    expect(pub.currentPrompt?.optionB).toBeDefined();
    expect(pub.roundReveal).toBeUndefined();
  });

  it('collects votes and calculates majority and predictor bonus', () => {
    // P1 votes A, predicts A
    game.handleAction(p1Id, { type: 'submit_vote', payload: { choice: 'A', prediction: 'A' } });
    // P2 votes A, predicts B
    game.handleAction(p2Id, { type: 'submit_vote', payload: { choice: 'A', prediction: 'B' } });
    // P3 votes B, predicts B
    game.handleAction(p3Id, { type: 'submit_vote', payload: { choice: 'B', prediction: 'B' } });

    // Since all 3 answered, phase is now ROUND_END
    expect(game.phase).toBe('ROUND_END');

    const pub = game.getPublicState();
    expect(pub.roundReveal).toBeDefined();
    // 2 votes for A, 1 vote for B => majority A
    expect(pub.roundReveal?.majority).toBe('A');
    expect(pub.roundReveal?.percentA).toBe(67);
    expect(pub.roundReveal?.percentB).toBe(33);

    // P1 predicted A (correct majority) -> participation (150) + prediction bonus (250) = 400
    expect(game.scores[p1Id]).toBe(400);

    // P2 voted A but predicted B (wrong prediction) -> participation only (150)
    expect(game.scores[p2Id]).toBe(150);
  });
});
