import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtPayload } from '../decorators/current-user.decorator';
import { PresenceAuthDTO } from '../types';
import {
  PRIVATE_USER_CHANNEL_PREFIX,
  PresenceService,
} from './presence.service';

export const ONLINE_USERS_CHANNEL = 'presence-online-users';

@ApiTags('Presence')
@Controller('presence')
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Post('auth')
  @ApiOperation({
    summary: 'Authorize a Pusher presence/private-channel subscription',
  })
  authorizeChannel(
    @Body() body: PresenceAuthDTO,
    @CurrentUser() user: JwtPayload,
  ) {
    if (body.channel_name === ONLINE_USERS_CHANNEL) {
      return this.presenceService.authorizePresenceChannel(
        body.socket_id,
        body.channel_name,
        user._id,
        { email: user.email },
      );
    }

    if (body.channel_name === `${PRIVATE_USER_CHANNEL_PREFIX}${user._id}`) {
      return this.presenceService.authorizePrivateChannel(
        body.socket_id,
        body.channel_name,
      );
    }

    throw new BadRequestException('Unknown presence channel');
  }
}
