import { BaseGame } from './BaseGame';
import { Room } from '../room/Room';
import { DrawAndGuessGame } from './games/DrawAndGuessGame';
import { QuizBattleGame } from './games/QuizBattleGame';
import { HotTakesGame } from './games/HotTakesGame';
import { ReactionArenaGame } from './games/ReactionArenaGame';

export class GameFactory {
  public static create(gameId: string, room: Room): BaseGame {
    switch (gameId) {
      case 'draw-and-guess':
        return new DrawAndGuessGame(room);
      case 'quiz-battle':
        return new QuizBattleGame(room);
      case 'hot-takes':
        return new HotTakesGame(room);
      case 'reaction-arena':
        return new ReactionArenaGame(room);
      default:
        throw new Error(`Unsupported game id: ${gameId}`);
    }
  }
}
