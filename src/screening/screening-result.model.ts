import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { JobApplication } from '../job-application/job-application.model';

export enum RequirementCategory {
  REQUIRED_SKILL = 'REQUIRED_SKILL',
  PREFERRED_SKILL = 'PREFERRED_SKILL',
  EXPERIENCE = 'EXPERIENCE',
  EDUCATION = 'EDUCATION',
  RESPONSIBILITY = 'RESPONSIBILITY',
}

export enum RequirementStatus {
  MATCHED = 'MATCHED',
  MISSING = 'MISSING',
  UNCERTAIN = 'UNCERTAIN',
}

export enum ConfidenceLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum MatchStatus {
  STRONG_MATCH = 'STRONG_MATCH',
  GOOD_MATCH = 'GOOD_MATCH',
  PARTIAL_MATCH = 'PARTIAL_MATCH',
  WEAK_MATCH = 'WEAK_MATCH',
}

@Schema({ _id: false })
export class ScreeningRequirement {
  @Prop({ type: String, enum: RequirementCategory, required: true })
  category!: RequirementCategory;

  @Prop({ required: true })
  requirement!: string;

  @Prop({ type: String, enum: RequirementStatus, required: true })
  status!: RequirementStatus;

  @Prop({ required: true })
  evidence!: string;

  @Prop({ type: String, enum: ConfidenceLevel, required: true })
  confidence!: ConfidenceLevel;
}

export const ScreeningRequirementSchema =
  SchemaFactory.createForClass(ScreeningRequirement);

export type ScreeningResultDocument = HydratedDocument<ScreeningResult>;

@Schema({ timestamps: true, versionKey: false })
export class ScreeningResult {
  @Prop({ type: Types.ObjectId, ref: JobApplication.name, required: true })
  jobApplicationId!: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 100 })
  matchScore!: number;

  @Prop({ type: String, enum: MatchStatus, required: true })
  matchStatus!: MatchStatus;

  @Prop({ type: String, enum: ConfidenceLevel, required: true })
  confidence!: ConfidenceLevel;

  @Prop({ required: true })
  summary!: string;

  @Prop({ type: [ScreeningRequirementSchema], default: [] })
  requirements!: ScreeningRequirement[];

  @Prop({ type: [String], default: [] })
  strengths!: string[];

  @Prop({ type: [String], default: [] })
  gaps!: string[];

  @Prop({ type: [String], default: [] })
  uncertainties!: string[];

  @Prop({ required: true })
  reasoning!: string;
}

export const ScreeningResultSchema =
  SchemaFactory.createForClass(ScreeningResult);
