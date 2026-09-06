import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobPost, JobPostSchema } from './job-post.model';
import { JobPostService } from './job-post.service';
import { JobPostController } from './job-post.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: JobPost.name, schema: JobPostSchema }]),
  ],
  controllers: [JobPostController],
  providers: [JobPostService],
  exports: [JobPostService],
})
export class JobPostModule {}
