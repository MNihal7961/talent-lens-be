import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import {
  JoB_APPLICATION_SCREENING_STATUS_UPDATED_EVENT,
  JoB_APPLICATION_STATUS_UPDATED_EVENT,
  JobApplicationScreeningStatusUpdatedEvent,
  JobApplicationStatusUpdatedEvent,
} from '../events';
import {
  JobApplication,
  JobApplicationDocument,
  JobApplicationStatus,
  ScreeningStatus,
} from './job-application.model';

@Injectable()
export class JobApplicationService {
  constructor(
    @InjectModel(JobApplication.name)
    private readonly jobApplicationModel: Model<JobApplicationDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createJobApplication(
    createdById: string,
    jobPostId: string,
    fileName: string,
  ) {
    return await this.jobApplicationModel.create({
      createdBy: createdById,
      jobPostId: jobPostId,
      fileName: fileName,
    });
  }

  async updateScreeningStatus(
    jobApplicationId: string,
    status: ScreeningStatus,
  ) {
    const updatedJobApplication = await this.jobApplicationModel
      .findByIdAndUpdate(
        jobApplicationId,
        { screeningStatus: status },
        { returnDocument: 'after' },
      )
      .exec();

    if (updatedJobApplication) {
      this.eventEmitter.emit(
        JoB_APPLICATION_SCREENING_STATUS_UPDATED_EVENT,
        new JobApplicationScreeningStatusUpdatedEvent(updatedJobApplication),
      );
    }

    return updatedJobApplication;
  }

  async updateApplicationStatus(
    jobApplicationId: string,
    status: JobApplicationStatus,
  ) {
    const updatedJobApplication = await this.jobApplicationModel
      .findByIdAndUpdate(
        jobApplicationId,
        { status },
        { returnDocument: 'after' },
      )
      .exec();

    if (updatedJobApplication) {
      this.eventEmitter.emit(
        JoB_APPLICATION_STATUS_UPDATED_EVENT,
        new JobApplicationStatusUpdatedEvent(updatedJobApplication),
      );
    }

    return updatedJobApplication;
  }

  async findApplicationById(id: string) {
    if (!isValidObjectId(id)) {
      return null;
    }
    return await this.jobApplicationModel.findById(id).exec();
  }

  async findApplicationByJobPostId(jobPostId: string) {
    return await this.jobApplicationModel
      .find({ jobPostId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findApplicationByResumeId(resumeId: string) {
    return await this.jobApplicationModel.findOne({ resumeId }).exec();
  }
}
