import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDTO, UpdateJobApplicationStatusDTO } from '../types';
import { JobApplicationService } from './job-application.service';

@ApiTags('JobApplication')
@ApiBearerAuth()
@Controller('job-application')
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

  @Get('job-post/:jobPostId')
  @ApiOperation({ summary: 'List job applications for a job post' })
  @ApiOkResponse({ description: 'Job applications for the job post' })
  async findByJobPostId(@Param('jobPostId') jobPostId: string) {
    return await this.jobApplicationService.findApplicationByJobPostId(
      jobPostId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job application by id' })
  @ApiOkResponse({ description: 'Job application' })
  @ApiNotFoundResponse({
    description: 'Job application not found',
    type: ErrorResponseDTO,
  })
  async findById(@Param('id') id: string) {
    const jobApplication =
      await this.jobApplicationService.findApplicationById(id);
    if (!jobApplication) {
      throw new NotFoundException('Job application not found');
    }
    return jobApplication;
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update a job application status' })
  @ApiOkResponse({ description: 'Job application updated' })
  @ApiNotFoundResponse({
    description: 'Job application not found',
    type: ErrorResponseDTO,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateJobApplicationStatusDto: UpdateJobApplicationStatusDTO,
  ) {
    const jobApplication =
      await this.jobApplicationService.updateApplicationStatus(
        id,
        updateJobApplicationStatusDto.status,
      );
    if (!jobApplication) {
      throw new NotFoundException('Job application not found');
    }
    return jobApplication;
  }
}
