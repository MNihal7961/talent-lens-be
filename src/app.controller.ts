import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator';
import { HealthResponseDTO } from './types';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ description: 'Service is up', type: HealthResponseDTO })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('statistics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics for the current user' })
  @ApiOkResponse({ description: 'Dashboard statistics' })
  async getStatistics(@CurrentUser() user: JwtPayload) {
    return await this.appService.getStatistics(user._id);
  }
}
