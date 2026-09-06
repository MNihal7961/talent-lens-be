import { JobApplicationDocument } from '../job-application/job-application.model';
import { ResumeDocument } from '../resume/resume.model';

export const START_SCREENING_EVENT = 'screening.start';
export const RESUME_SAVED_EVENT = 'resume.saved';
export const JoB_APPLICATION_SCREENING_STATUS_UPDATED_EVENT =
  'job.application.screening.status.updated';
export const JoB_APPLICATION_STATUS_UPDATED_EVENT =
  'job.application.status.updated';

export class StartScreeningEvent {
  constructor(
    public readonly jobApplicationId: string,
    public readonly resumeFile: Express.Multer.File,
  ) {}
}

export class ResumeSavedEvent {
  constructor(
    public readonly resume: ResumeDocument,
    public readonly jobPostId: string,
  ) {}
}

export class JobApplicationScreeningStatusUpdatedEvent {
  constructor(public readonly updatedJobApplication: JobApplicationDocument) {}
}

export class JobApplicationStatusUpdatedEvent {
  constructor(public readonly updatedJobApplication: JobApplicationDocument) {}
}
