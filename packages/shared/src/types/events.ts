import { Player, RoomSettings, RoomSnapshot, ChatMessage, EmojiReaction } from './room';
import { GameResultPayload } from './game';
import { DrawStroke } from './games/draw-and-guess';

export interface ClientToServerEvents {
  'room:create': (
    data: { nickname: string; avatar: string; settings?: Partial<RoomSettings> },
    callback: (response: { success: boolean; roomCode?: string; sessionToken?: string; error?: string }) => void
  ) => void;

  'room:join': (
    data: { roomCode: string; nickname: string; avatar: string; sessionToken?: string },
    callback: (response: { success: boolean; roomCode?: string; sessionToken?: string; error?: string }) => void
  ) => void;

  'room:reconnect': (
    data: { roomCode: string; sessionToken: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void;

  'room:leave': () => void;

  'room:set_ready': (data: { isReady: boolean }) => void;

  'room:select_game': (data: { gameId: string }) => void;

  'room:update_settings': (data: { settings: Partial<RoomSettings> }) => void;

  'room:start_game': () => void;

  'room:return_to_lobby': () => void;

  'room:add_bot': (callback?: (res: { success: boolean }) => void) => void;

  'room:remove_bot': (data: { botId: string }) => void;

  'chat:send': (data: { text: string }) => void;

  'reaction:send': (data: { emoji: string }) => void;

  'game:action': (
    data: { type: string; payload: any },
    callback?: (res: { success: boolean; error?: string }) => void
  ) => void;

  'game:draw_stroke': (data: DrawStroke) => void;

  'game:clear_canvas': () => void;
}

export interface ServerToClientEvents {
  'room:snapshot': (snapshot: RoomSnapshot) => void;
  'room:player_joined': (player: Player) => void;
  'room:player_left': (data: { playerId: string; nickname: string; reason?: string }) => void;
  'room:player_updated': (player: Player) => void;
  'room:game_selected': (data: { gameId: string }) => void;
  'room:chat_message': (message: ChatMessage) => void;
  'room:reaction': (reaction: EmojiReaction) => void;
  'game:public_state': (state: any) => void;
  'game:private_state': (state: any) => void;
  'game:stroke': (stroke: DrawStroke) => void;
  'game:clear_canvas': () => void;
  'game:ended': (results: GameResultPayload) => void;
  'error': (data: { message: string; code?: string }) => void;
}
