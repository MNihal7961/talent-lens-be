import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../user/user.model';

@Schema({ _id: false })
export class ResumeUser {
  @Prop({ required: true })
  firstName!: string;

  @Prop({ type: String, default: null })
  lastName!: string | null;
}

export const ResumeUserSchema = SchemaFactory.createForClass(ResumeUser);

@Schema({ _id: false })
export class ContactInfo {
  @Prop({ type: String, default: null })
  email!: string | null;

  @Prop({ type: String, default: null })
  phoneNumber!: string | null;
}

export const ContactInfoSchema = SchemaFactory.createForClass(ContactInfo);

@Schema({ _id: false })
export class Links {
  @Prop({ type: String, default: null })
  linkedInUrl!: string | null;

  @Prop({ type: String, default: null })
  githubUrl!: string | null;

  @Prop({ type: String, default: null })
  portfolioUrl!: string | null;
}

export const LinksSchema = SchemaFactory.createForClass(Links);

@Schema({ _id: false })
export class Project {
  @Prop({ required: true })
  title!: string;

  @Prop({ type: [String], default: [] })
  skills!: string[];

  @Prop({ type: String, default: null })
  description!: string | null;

  @Prop({ type: String, default: null })
  githubUrl!: string | null;

  @Prop({ type: String, default: null })
  liveUrl!: string | null;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

@Schema({ _id: false })
export class Experience {
  @Prop({ required: true })
  companyName!: string;

  @Prop({ required: true })
  role!: string;

  @Prop({ type: String, default: null })
  startDate!: string | null;

  @Prop({ type: String, default: null })
  endDate!: string | null;

  @Prop({ required: true })
  description!: string;
}

export const ExperienceSchema = SchemaFactory.createForClass(Experience);

@Schema({ _id: false })
export class Education {
  @Prop({ required: true })
  university!: string;

  @Prop({ required: true })
  degree!: string;

  @Prop({ type: String, default: null })
  completedYear!: string | null;

  @Prop({ type: String, default: null })
  location!: string | null;

  @Prop({ type: String, default: null })
  description!: string | null;
}

export const EducationSchema = SchemaFactory.createForClass(Education);

@Schema({ _id: false })
export class Certification {
  @Prop({ required: true })
  title!: string;

  @Prop({ type: String, default: null })
  issuer!: string | null;

  @Prop({ type: String, default: null })
  year!: string | null;
}

export const CertificationSchema = SchemaFactory.createForClass(Certification);

export type ResumeDocument = HydratedDocument<Resume>;

@Schema({ timestamps: true, versionKey: false })
export class Resume {
  @Prop({ type: ResumeUserSchema, required: true })
  user!: ResumeUser;

  @Prop({ type: ContactInfoSchema, required: true })
  contactInfo!: ContactInfo;

  @Prop({ type: LinksSchema, required: true })
  links!: Links;

  @Prop({ required: true })
  profileSummary!: string;

  @Prop({ type: [String], default: [] })
  skills!: string[];

  @Prop({ type: [ProjectSchema], default: [] })
  projects!: Project[];

  @Prop({ type: [ExperienceSchema], default: [] })
  experience!: Experience[];

  @Prop({ type: [EducationSchema], default: [] })
  education!: Education[];

  @Prop({ type: [CertificationSchema], default: [] })
  certifications!: Certification[];

  @Prop({ type: [String], default: [] })
  achievements!: string[];

  @Prop({ type: [String], default: [] })
  languages!: string[];

  @Prop({ type: String, default: null })
  otherInfo!: string | null;

  @Prop({ type: Number, default: 0 })
  totalYearsOfExperience!: number;

  @Prop({ type: String, default: null })
  recentRole!: string | null;

  @Prop({ required: true })
  fileName!: string;

  @Prop({ required: true })
  rawFileLink!: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  uploadedBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobApplication', required: true })
  jobApplicationId!: Types.ObjectId;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
