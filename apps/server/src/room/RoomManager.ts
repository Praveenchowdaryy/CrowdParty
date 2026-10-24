import { Room } from './Room';

const CODE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Unambiguous characters

export class RoomManager {
  private static instance: RoomManager;
  public rooms: Map<string, Room> = new Map();
  private tickInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startTickLoop();
    this.startCleanupLoop();
  }

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  public generateRoomCode(): string {
    let attempts = 0;
    while (attempts < 500) {
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
      }
      if (!this.rooms.has(code)) {
        return code;
      }
      attempts++;
    }
    // Fallback timestamp code
    return `R${Date.now().toString(36).toUpperCase().slice(-5)}`;
  }

  public createRoom(): Room {
    const code = this.generateRoomCode();
    const room = new Room(code, '', (emptyCode) => {
      // Auto-schedule removal if room remains empty
      setTimeout(() => {
        const r = this.rooms.get(emptyCode);
        if (r) {
          const onlineHumans = Array.from(r.players.values()).filter(p => p.isOnline && !p.isBot).length;
          if (onlineHumans === 0) {
            this.rooms.delete(emptyCode);
          }
        }
      }, 1000 * 60 * 10); // 10 minutes grace period
    });

    this.rooms.set(code, room);
    return room;
  }

  public getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase().trim());
  }

  public removeRoom(code: string): boolean {
    const r = this.rooms.get(code.toUpperCase().trim());
    if (r) {
      if (r.activeGame) {
        r.activeGame.dispose();
      }
      return this.rooms.delete(code.toUpperCase().trim());
    }
    return false;
  }

  private startTickLoop(): void {
    // 100ms high-resolution game engine loop
    this.tickInterval = setInterval(() => {
      const now = Date.now();
      for (const room of this.rooms.values()) {
        try {
          room.tick(now);
        } catch (err) {
          console.error(`Error ticking room ${room.code}:`, err);
        }
      }
    }, 100);
  }

  private startCleanupLoop(): void {
    // Check every 10 minutes for rooms idle for > 4 hours
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const MAX_IDLE = 1000 * 60 * 60 * 4; // 4 hours
      for (const [code, room] of this.rooms.entries()) {
        if (now - room.lastActivity > MAX_IDLE) {
          console.log(`Cleaning up idle room: ${code}`);
          if (room.activeGame) room.activeGame.dispose();
          this.rooms.delete(code);
        }
      }
    }, 1000 * 60 * 10);
  }

  public dispose(): void {
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    for (const room of this.rooms.values()) {
      if (room.activeGame) room.activeGame.dispose();
    }
    this.rooms.clear();
  }
}
