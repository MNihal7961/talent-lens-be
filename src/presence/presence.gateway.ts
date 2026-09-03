import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../decorators/current-user.decorator';
import { PresenceService } from './presence.service';

@WebSocketGateway({ cors: true })
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(PresenceGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly presenceService: PresenceService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      client.data.user = payload;

      const cameOnline = this.presenceService.addConnection(
        payload._id,
        client.id,
      );
      if (cameOnline) {
        this.server.emit('presence:online', { userId: payload._id });
      }
    } catch {
      this.logger.warn(`Rejected socket connection: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user as JwtPayload | undefined;
    if (!user) {
      return;
    }

    const wentOffline = this.presenceService.removeConnection(
      user._id,
      client.id,
    );
    if (wentOffline) {
      this.server.emit('presence:offline', { userId: user._id });
    }
  }

  @SubscribeMessage('presence:list')
  handleListOnline(@ConnectedSocket() client: Socket) {
    if (!client.data.user) {
      return;
    }
    return this.presenceService.getOnlineUserIds();
  }

  private extractToken(client: Socket): string {
    const authToken = client.handshake.auth?.token as string | undefined;
    const headerToken = client.handshake.headers.authorization?.split(' ')[1];
    const token = authToken ?? headerToken;

    if (!token) {
      throw new Error('Missing authentication token');
    }
    return token;
  }
}
