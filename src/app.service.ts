import { Injectable } from '@nestjs/common';
import { JobPostService } from './job-post/job-post.service';
import { JobApplicationService } from './job-application/job-application.service';

@Injectable()
export class AppService {
  constructor(
    private readonly jobPostService: JobPostService,
    private readonly jobApplicationService: JobApplicationService,
  ) {}

  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  async getStatistics(userId: string) {
    const [totalJobPosts, applicationStats] = await Promise.all([
      this.jobPostService.countByUserId(userId),
      this.jobApplicationService.getStatisticsByUserId(userId),
    ]);

    return {
      totalJobPosts,
      totalApplications: applicationStats.total,
      shortlisted: applicationStats.shortlisted,
      rejected: applicationStats.rejected,
    };
  }
}
