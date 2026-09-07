import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { GoogleGenAI, Schema } from '@google/genai';
import { Model, isValidObjectId } from 'mongoose';
import { JobPost, JobPostDocument } from './job-post.model';
import {
  JOB_POST_SCHEMA,
  JOB_POST_SYSTEM_PROMPT,
  JOB_POST_VALIDATION_SCHEMA,
  JOB_POST_VALIDATION_SYSTEM_PROMPT,
} from '../prompts/job-post.prompts';

const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 500;
const RETRYABLE_STATUS_CODES = new Set([429, 503]);

export type GeneratedJobPost = Pick<
  JobPost,
  | 'title'
  | 'description'
  | 'requiredSkills'
  | 'preferredSkills'
  | 'responsibilities'
  | 'education'
  | 'experience'
>;

type PromptValidationResult = {
  valid: boolean;
  reason: string;
};

@Injectable()
export class JobPostService {
  private readonly logger = new Logger(JobPostService.name);

  constructor(
    @InjectModel(JobPost.name)
    private readonly jobPostModel: Model<JobPostDocument>,
    private readonly configService: ConfigService,
  ) {}

  async findById(id: string) {
    if (!isValidObjectId(id)) {
      return null;
    }
    return await this.jobPostModel.findById(id).exec();
  }

  async findAllByUserId(userId: string) {
    return await this.jobPostModel
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async countByUserId(userId: string) {
    return await this.jobPostModel.countDocuments({ createdBy: userId }).exec();
  }

  async save(jobPost: GeneratedJobPost, userId: string) {
    return await this.jobPostModel.create({
      ...jobPost,
      createdBy: userId,
    });
  }

  async genarteJobPost(userMessage: string): Promise<GeneratedJobPost> {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
    const ai = new GoogleGenAI({ apiKey });

    const validationContent = await this.generate(
      ai,
      JOB_POST_VALIDATION_SYSTEM_PROMPT,
      userMessage,
      JOB_POST_VALIDATION_SCHEMA,
    );
    const validation =
      this.parseJson<PromptValidationResult>(validationContent);
    if (!validation.valid) {
      throw new BadRequestException(
        validation.reason || 'The message could not be turned into a job post',
      );
    }

    const jobPostContent = await this.generate(
      ai,
      JOB_POST_SYSTEM_PROMPT,
      userMessage,
      JOB_POST_SCHEMA,
    );
    return this.parseJson<GeneratedJobPost>(jobPostContent);
  }

  private async generate(
    ai: GoogleGenAI,
    systemInstruction: string,
    userMessage: string,
    responseSchema: Schema,
  ): Promise<string> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: userMessage,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema,
          },
        });

        if (!response.text) {
          this.logger.error('Gemini response had no text content');
          throw new BadGatewayException('Failed to generate job post');
        }
        return response.text;
      } catch (error) {
        if (error instanceof BadGatewayException) {
          throw error;
        }

        const statusCode =
          error instanceof Error && 'status' in error
            ? (error as { status?: number }).status
            : undefined;
        this.logger.error(
          `Gemini request failed (attempt ${attempt}/${MAX_ATTEMPTS})${
            statusCode ? ` (status ${statusCode})` : ''
          }: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
        );

        const isRetryable =
          statusCode !== undefined && RETRYABLE_STATUS_CODES.has(statusCode);
        if (!isRetryable || attempt === MAX_ATTEMPTS) {
          throw new BadGatewayException('Failed to generate job post');
        }
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * attempt),
        );
      }
    }

    throw new BadGatewayException('Failed to generate job post');
  }

  private parseJson<T>(content: string): T {
    const trimmed = content.trim();
    const fenceMatch = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed);
    const json = fenceMatch ? fenceMatch[1] : trimmed;

    try {
      return JSON.parse(json) as T;
    } catch (error) {
      this.logger.error(
        `Failed to parse Gemini response as JSON: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      this.logger.debug(`Raw Gemini response: ${content}`);
      throw new BadGatewayException('Failed to generate job post');
    }
  }
}
