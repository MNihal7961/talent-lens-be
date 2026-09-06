import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from './resume.model';

const RESUME_PARSE_WEBHOOK_PATH = '/webhook/resume/parse';
const CLOUDINARY_RESUME_FOLDER = 'resumes';

export type ParsedResume = Pick<
  Resume,
  | 'user'
  | 'contactInfo'
  | 'links'
  | 'profileSummary'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'education'
  | 'certifications'
  | 'achievements'
  | 'languages'
  | 'otherInfo'
  | 'totalYearsOfExperience'
  | 'recentRole'
>;

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Resume.name)
    private readonly resumeModel: Model<ResumeDocument>,
  ) {}

  async parseResume(resume: Express.Multer.File): Promise<ParsedResume> {
    const n8nBaseUrl = this.configService.getOrThrow<string>('N8N_BASE_URL');

    const formData = new FormData();
    formData.append(
      'resume',
      new Blob([new Uint8Array(resume.buffer)], { type: resume.mimetype }),
      resume.originalname,
    );

    let response: Response;
    try {
      response = await fetch(`${n8nBaseUrl}${RESUME_PARSE_WEBHOOK_PATH}`, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      this.logger.error(
        `Failed to reach n8n resume parse webhook: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new BadGatewayException('Failed to parse resume');
    }

    if (!response.ok) {
      this.logger.error(`n8n resume parse webhook returned ${response.status}`);
      throw new BadGatewayException('Failed to parse resume');
    }

    return (await response.json()) as ParsedResume;
  }

  async saveResume(
    resume: Express.Multer.File,
    uploadedById: string,
    parsedResume: ParsedResume,
    jobApplicationId: string,
  ) {
    const rawFileLink = await this.uploadResumeFile(resume);

    return await this.resumeModel.create({
      ...parsedResume,
      fileName: resume.originalname,
      rawFileLink,
      uploadedBy: uploadedById,
      jobApplicationId,
    });
  }

  private async uploadResumeFile(resume: Express.Multer.File): Promise<string> {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    });

    try {
      const dataUri = `data:${resume.mimetype};base64,${resume.buffer.toString('base64')}`;
      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: CLOUDINARY_RESUME_FOLDER,
        resource_type: 'auto',
        use_filename: true,
        filename_override: resume.originalname,
      });
      return uploadResult.secure_url;
    } catch (error) {
      this.logger.error(
        `Failed to upload resume to Cloudinary: ${this.stringifyError(error)}`,
      );
      throw new BadGatewayException('Failed to upload resume file');
    }
  }

  private stringifyError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const { message } = error;
      if (typeof message === 'string') {
        return message;
      }
    }
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
}
