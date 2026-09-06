import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResumeService } from './resume.service';

@ApiTags('Resume')
@ApiBearerAuth()
@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}
}
