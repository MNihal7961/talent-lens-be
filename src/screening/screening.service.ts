import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RESUME_SAVED_EVENT,
  ResumeSavedEvent,
  START_SCREENING_EVENT,
  StartScreeningEvent,
} from '../events';
import { ScreeningStatus } from '../job-application/job-application.model';
import { JobApplicationService } from '../job-application/job-application.service';
import { ResumeService } from '../resume/resume.service';
import {
  ScreeningResult,
  ScreeningResultDocument,
} from './screening-result.model';

const SCREENING_WEBHOOK_PATH = '/webhook/screening';

export type ScreeningResultData = Pick<
  ScreeningResult,
  | 'matchScore'
  | 'matchStatus'
  | 'confidence'
  | 'summary'
  | 'requirements'
  | 'strengths'
  | 'gaps'
  | 'uncertainties'
  | 'reasoning'
>;

@Injectable()
export class ScreeningService {
  private readonly logger = new Logger(ScreeningService.name);

  constructor(
    private readonly resumeService: ResumeService,
    private readonly jobApplicationService: JobApplicationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
    @InjectModel(ScreeningResult.name)
    private readonly screeningResultModel: Model<ScreeningResultDocument>,
  ) {}

  async screenResume(
    jobPostId: string,
    createdById: string,
    resume: Express.Multer.File,
  ) {
    const jobApplication =
      await this.jobApplicationService.createJobApplication(
        createdById,
        jobPostId,
        resume.originalname,
      );

    this.eventEmitter.emit(
      START_SCREENING_EVENT,
      new StartScreeningEvent(String(jobApplication._id), resume),
    );

    return jobApplication;
  }

  async saveScreeningResult(
    jobApplicationId: string,
    result: ScreeningResultData,
  ) {
    return await this.screeningResultModel.create({
      ...result,
      jobApplicationId,
    });
  }

  async getScreeningResultByJobApplicationId(jobApplicationId: string) {
    return await this.screeningResultModel.findOne({ jobApplicationId }).exec();
  }

  @OnEvent(START_SCREENING_EVENT)
  async handleStartScreening({
    jobApplicationId,
    resumeFile,
  }: StartScreeningEvent) {
    try {
      const jobApplication =
        await this.jobApplicationService.findApplicationById(jobApplicationId);
      if (!jobApplication) {
        throw new Error(`Job application ${jobApplicationId} not found`);
      }

      // Update Screening Status to RESUME_PARSING_STARTED
      await this.jobApplicationService.updateScreeningStatus(
        jobApplicationId,
        ScreeningStatus.RESUME_PARSING_STARTED,
      );

      // Parse Resume
      const parsedResume = await this.resumeService.parseResume(resumeFile);

      // Update Screening Status to RESUME_PARSED
      await this.jobApplicationService.updateScreeningStatus(
        jobApplicationId,
        ScreeningStatus.RESUME_PARSED,
      );

      // Save resume
      const savedResume = await this.resumeService.saveResume(
        resumeFile,
        String(jobApplication.createdBy),
        parsedResume,
        jobApplicationId,
      );
      jobApplication.resumeId = savedResume._id;
      await jobApplication.save();

      this.eventEmitter.emit(
        RESUME_SAVED_EVENT,
        new ResumeSavedEvent(savedResume, jobApplication.jobPostId.toString()),
      );
    } catch (error) {
      await this.jobApplicationService.updateScreeningStatus(
        jobApplicationId,
        ScreeningStatus.RESUME_PARSING_FAILED,
      );

      this.logger.error(
        `Failed to screen resume for job application ${jobApplicationId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  @OnEvent(RESUME_SAVED_EVENT)
  async handleResumeSavedEvent({ resume, jobPostId }: ResumeSavedEvent) {
    const n8nBaseUrl = this.configService.getOrThrow<string>('N8N_BASE_URL');

    // Find job application by resume Id
    const jobApplication = await this.jobApplicationService.findApplicationById(
      String(resume.jobApplicationId),
    );
    if (!jobApplication) {
      this.logger.error(
        `No job application found for resume ${String(resume._id)}`,
      );
      return;
    }

    try {
      // Update screening status SCREENING_STARTED
      await this.jobApplicationService.updateScreeningStatus(
        String(jobApplication._id),
        ScreeningStatus.SCREENING_STARTED,
      );

      const response = await fetch(`${n8nBaseUrl}${SCREENING_WEBHOOK_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobPostId,
          resumeId: String(resume._id),
        }),
      });

      if (!response.ok) {
        throw new Error(`n8n screening webhook returned ${response.status}`);
      }

      const responseBody = (await response.json()) as {
        screeningResult: ScreeningResultData;
      };
      this.logger.log(
        `n8n screening webhook response: ${JSON.stringify(responseBody)}`,
      );

      // Save screening result
      await this.saveScreeningResult(
        String(jobApplication._id),
        responseBody.screeningResult,
      );

      // Update screening status SCREENING_COMPLETED
      await this.jobApplicationService.updateScreeningStatus(
        String(jobApplication._id),
        ScreeningStatus.SCREENING_COMPLETED,
      );
    } catch (error) {
      await this.jobApplicationService.updateScreeningStatus(
        String(jobApplication._id),
        ScreeningStatus.SCREENING_FAILED,
      );

      this.logger.error(
        `Failed to trigger screening workflow for resume ${String(resume._id)}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
