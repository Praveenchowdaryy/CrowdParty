import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RoomManager } from '../src/room/RoomManager';

describe('RoomManager', () => {
  let manager: RoomManager;

  beforeEach(() => {
    manager = RoomManager.getInstance();
    manager.rooms.clear();
  });

  afterEach(() => {
    manager.rooms.clear();
  });

  it('generates unique uppercase 6-character room codes', () => {
    const code1 = manager.generateRoomCode();
    const code2 = manager.generateRoomCode();

    expect(code1).toHaveLength(6);
    expect(code2).toHaveLength(6);
    expect(code1).not.toBe(code2);
    expect(code1).toMatch(/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
  });

  it('creates and retrieves rooms by code', () => {
    const room = manager.createRoom();
    expect(room.code).toBeDefined();

    const retrieved = manager.getRoom(room.code);
    expect(retrieved).toBe(room);

    // Case-insensitivity
    const lowerRetrieved = manager.getRoom(room.code.toLowerCase());
    expect(lowerRetrieved).toBe(room);
  });

  it('removes room by code', () => {
    const room = manager.createRoom();
    expect(manager.getRoom(room.code)).toBeDefined();

    const removed = manager.removeRoom(room.code);
    expect(removed).toBe(true);
    expect(manager.getRoom(room.code)).toBeUndefined();
  });
});
