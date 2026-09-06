import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
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
  ) {}

  async createJobApplication(createdById: string, jobPostId: string) {
    return await this.jobApplicationModel.create({
      createdBy: createdById,
      jobPost: jobPostId,
    });
  }

  async updateScreeningStatus(
    jobApplicationId: string,
    status: ScreeningStatus,
  ) {
    return await this.jobApplicationModel
      .findByIdAndUpdate(
        jobApplicationId,
        { screeningStatus: status },
        { new: true },
      )
      .exec();
  }

  async updateApplicationStatus(
    jobApplicationId: string,
    status: JobApplicationStatus,
  ) {
    return await this.jobApplicationModel
      .findByIdAndUpdate(jobApplicationId, { status }, { new: true })
      .exec();
  }

  async findApplicationById(id: string) {
    if (!isValidObjectId(id)) {
      return null;
    }
    return await this.jobApplicationModel.findById(id).exec();
  }

  async findApplicationByJobPostId(jobPostId: string) {
    return await this.jobApplicationModel
      .find({ jobPost: jobPostId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
