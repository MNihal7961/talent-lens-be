import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { JobPost } from '../job-post/job-post.model';
import { Resume } from '../resume/resume.model';
import { User } from '../user/user.model';

export enum JobApplicationStatus {
  APPLIED = 'applied',
  SHORTLISTED = 'shortListed',
  REJECTED = 'rejected',
}

export enum ScreeningStatus {
  PENDING = 'pending',
  RESUME_PARSING_STARTED = 'resume-parsing-started',
  RESUME_PARSED = 'resume-parsed',
  RESUME_PARSING_FAILED = 'resume-parsing-failed',
  SCREENING_STARTED = 'screening-started',
  SCREENING_FAILED = 'screening-failed',
  SCREENING_COMPLETED = 'screening-completed',
}

export type JobApplicationDocument = HydratedDocument<JobApplication>;

@Schema({ timestamps: true, versionKey: false })
export class JobApplication {
  @Prop({ type: Types.ObjectId, ref: JobPost.name, required: true })
  jobPost!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Resume.name, default: null })
  resumeId!: Types.ObjectId | null;

  @Prop({
    type: String,
    enum: JobApplicationStatus,
    default: JobApplicationStatus.APPLIED,
  })
  status!: JobApplicationStatus;

  @Prop({
    type: String,
    enum: ScreeningStatus,
    default: ScreeningStatus.PENDING,
  })
  screeningStatus!: ScreeningStatus;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy!: Types.ObjectId;
}

export const JobApplicationSchema =
  SchemaFactory.createForClass(JobApplication);
