import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher = require('pusher');

@Injectable()
export class PresenceService {
  private readonly pusher: Pusher;

  constructor(private readonly configService: ConfigService) {
    this.pusher = new Pusher({
      appId: this.configService.getOrThrow<string>('PUSHER_APP_ID'),
      key: this.configService.getOrThrow<string>('PUSHER_KEY'),
      secret: this.configService.getOrThrow<string>('PUSHER_SECRET'),
      cluster: this.configService.getOrThrow<string>('PUSHER_CLUSTER'),
      useTLS: true,
    });
  }

  authorizePresenceChannel(
    socketId: string,
    channelName: string,
    userId: string,
    userInfo: Record<string, unknown>,
  ) {
    return this.pusher.authorizeChannel(socketId, channelName, {
      user_id: userId,
      user_info: userInfo,
    });
  }
}
