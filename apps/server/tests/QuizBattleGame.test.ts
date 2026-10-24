import { describe, it, expect, beforeEach } from 'vitest';
import { Room } from '../src/room/Room';
import { QuizBattleGame } from '../src/engine/games/QuizBattleGame';

function createMockSocket() {
  return { connected: true, emit: () => {}, join: () => {}, leave: () => {} } as any;
}

describe('Quiz Battle Game Engine', () => {
  let room: Room;
  let game: QuizBattleGame;
  let p1Id: string;
  let p2Id: string;

  beforeEach(() => {
    room = new Room('QUIZ01', '');
    const { player: p1 } = room.addPlayer('TriviaKing', 'bear', createMockSocket());
    const { player: p2 } = room.addPlayer('TriviaQueen', 'lion', createMockSocket());
    p1Id = p1.id;
    p2Id = p2.id;

    game = new QuizBattleGame(room);
    game.start();
  });

  it('serves question with multiple options and hides correct answer in public state', () => {
    const pub = game.getPublicState();
    expect(pub.currentQuestion).toBeDefined();
    expect(pub.currentQuestion?.options.length).toBe(4);
    // Ensure correctOptionId is NOT exposed in the public question object
    expect((pub.currentQuestion as any).correctOptionId).toBeUndefined();
  });

  it('records player answers and prevents duplicates', () => {
    const pub = game.getPublicState();
    const optId = pub.currentQuestion!.options[0].id;

    const res1 = game.handleAction(p1Id, {
      type: 'submit_answer',
      payload: { optionId: optId },
    });
    expect(res1.success).toBe(true);

    // Duplicate submission
    const res2 = game.handleAction(p1Id, {
      type: 'submit_answer',
      payload: { optionId: optId },
    });
    expect(res2.success).toBe(false);
    expect(res2.error).toBe('Answer already submitted');
  });

  it('transitions to reveal when all players have answered', () => {
    const pub = game.getPublicState();
    const optId = pub.currentQuestion!.options[0].id;

    game.handleAction(p1Id, { type: 'submit_answer', payload: { optionId: optId } });
    game.handleAction(p2Id, { type: 'submit_answer', payload: { optionId: optId } });

    // Since both players answered, should advance to reveal
    expect(game.phase).toBe('ROUND_END');
    const revealPub = game.getPublicState();
    expect(revealPub.roundReveal).toBeDefined();
    expect(revealPub.roundReveal?.correctOptionId).toBeDefined();
  });
});
