import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private readonly onlineUsers = new Map<string, Set<string>>();

  addConnection(userId: string, socketId: string): boolean {
    const sockets = this.onlineUsers.get(userId) ?? new Set<string>();
    const cameOnline = sockets.size === 0;
    sockets.add(socketId);
    this.onlineUsers.set(userId, sockets);
    return cameOnline;
  }

  removeConnection(userId: string, socketId: string): boolean {
    const sockets = this.onlineUsers.get(userId);
    if (!sockets) {
      return false;
    }

    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.onlineUsers.delete(userId);
      return true;
    }
    return false;
  }

  isOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  getOnlineUserIds(): string[] {
    return Array.from(this.onlineUsers.keys());
  }
}
