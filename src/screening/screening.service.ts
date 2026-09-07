import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { waitUntil } from '@vercel/functions';
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
  RequirementStatus,
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

    // The full parse -> match -> notify pipeline runs after this handler
    // returns. On Vercel, the function can freeze as soon as the response is
    // sent, silently killing any still-pending fire-and-forget work — so we
    // chain the whole pipeline into one promise (via emitAsync, both here and
    // in every event handler/status update it triggers) and hand it to
    // waitUntil, which keeps the function alive until that promise settles.
    // waitUntil is a no-op outside the Vercel request context (e.g. locally),
    // where the persistent process already lets this finish on its own.
    const backgroundScreening = this.eventEmitter.emitAsync(
      START_SCREENING_EVENT,
      new StartScreeningEvent(String(jobApplication._id), resume),
    );
    waitUntil(backgroundScreening);

    return jobApplication;
  }

  async saveScreeningResult(
    jobApplicationId: string,
    result: ScreeningResultData,
  ) {
    return await this.screeningResultModel.create({
      ...result,
      requirements: result.requirements.map((requirement) => ({
        ...requirement,
        status: this.normalizeRequirementStatus(requirement.status),
      })),
      jobApplicationId,
    });
  }

  private normalizeRequirementStatus(status: string): RequirementStatus {
    if (
      (Object.values(RequirementStatus) as string[]).includes(status)
    ) {
      return status as RequirementStatus;
    }

    this.logger.warn(
      `n8n returned an unexpected requirement status "${status}"; falling back to UNCERTAIN`,
    );
    return RequirementStatus.UNCERTAIN;
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
      jobApplication.candidateName = [
        parsedResume.user.firstName,
        parsedResume.user.lastName,
      ]
        .filter(Boolean)
        .join(' ');
      await jobApplication.save();

      // Awaited (via emitAsync, not a fire-and-forget emit) so this handler's
      // own returned promise — which screenResume() hands to waitUntil —
      // doesn't resolve until the rest of the pipeline (handleResumeSavedEvent)
      // finishes too.
      await this.eventEmitter.emitAsync(
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
