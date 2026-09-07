import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDTO } from '../types';
import { ResumeService } from './resume.service';

@ApiTags('Resume')
@ApiBearerAuth()
@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a resume by id' })
  @ApiOkResponse({ description: 'Resume' })
  @ApiNotFoundResponse({
    description: 'Resume not found',
    type: ErrorResponseDTO,
  })
  async findById(@Param('id') id: string) {
    const resume = await this.resumeService.findById(id);
    if (!resume) {
      throw new NotFoundException('Resume not found');
    }
    return resume;
  }
}
