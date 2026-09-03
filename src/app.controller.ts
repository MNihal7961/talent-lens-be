import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';
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
}
