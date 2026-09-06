import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../user/user.model';

@Schema({ _id: false })
export class Education {
  @Prop({ default: false })
  required!: boolean;

  @Prop({ required: true })
  degree!: string;

  @Prop({ required: true })
  field!: string;
}

export const EducationSchema = SchemaFactory.createForClass(Education);

@Schema({ _id: false })
export class Experience {
  @Prop({ default: -1 })
  minimumYears!: number;

  @Prop({ default: -1 })
  maximumYears!: number;
}

export const ExperienceSchema = SchemaFactory.createForClass(Experience);

export type JobPostDocument = HydratedDocument<JobPost>;

@Schema({ timestamps: true, versionKey: false })
export class JobPost {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: [String], default: [] })
  requiredSkills!: string[];

  @Prop({ type: [String], default: [] })
  preferredSkills!: string[];

  @Prop({ type: [String], default: [] })
  responsibilities!: string[];

  @Prop({ type: EducationSchema })
  education!: Education;

  @Prop({ type: ExperienceSchema })
  experience!: Experience;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy!: Types.ObjectId;
}

export const JobPostSchema = SchemaFactory.createForClass(JobPost);
