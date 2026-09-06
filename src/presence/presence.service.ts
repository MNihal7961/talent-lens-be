import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import Pusher = require('pusher');
import {
  JoB_APPLICATION_SCREENING_STATUS_UPDATED_EVENT,
  JoB_APPLICATION_STATUS_UPDATED_EVENT,
  JobApplicationScreeningStatusUpdatedEvent,
  JobApplicationStatusUpdatedEvent,
} from '../events';

export const PRIVATE_USER_CHANNEL_PREFIX = 'private-user-';

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
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

  authorizePrivateChannel(socketId: string, channelName: string) {
    return this.pusher.authorizeChannel(socketId, channelName);
  }

  @OnEvent(JoB_APPLICATION_SCREENING_STATUS_UPDATED_EVENT)
  handleScreeningStatusUpdated({
    updatedJobApplication,
  }: JobApplicationScreeningStatusUpdatedEvent) {
    void this.notifyUser(
      String(updatedJobApplication.createdBy),
      'job-application:screening-status-updated',
      {
        message: `Screening status updated to ${updatedJobApplication.screeningStatus}`,
        updatedJobApplication,
      },
    );
  }

  @OnEvent(JoB_APPLICATION_STATUS_UPDATED_EVENT)
  handleApplicationStatusUpdated({
    updatedJobApplication,
  }: JobApplicationStatusUpdatedEvent) {
    void this.notifyUser(
      String(updatedJobApplication.createdBy),
      'job-application:status-updated',
      {
        message: `Application status updated to ${updatedJobApplication.status}`,
        updatedJobApplication,
      },
    );
  }

  private async notifyUser(userId: string, event: string, data: unknown) {
    try {
      await this.pusher.trigger(
        `${PRIVATE_USER_CHANNEL_PREFIX}${userId}`,
        event,
        data,
      );
    } catch (error) {
      this.logger.error(
        `Failed to notify user ${userId} via Pusher: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
