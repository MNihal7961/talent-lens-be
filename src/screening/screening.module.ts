import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobApplicationModule } from '../job-application/job-application.module';
import { ResumeModule } from '../resume/resume.module';
import {
  ScreeningResult,
  ScreeningResultSchema,
} from './screening-result.model';
import { ScreeningController } from './screening.controller';
import { ScreeningService } from './screening.service';

@Module({
  imports: [
    ResumeModule,
    JobApplicationModule,
    MongooseModule.forFeature([
      { name: ScreeningResult.name, schema: ScreeningResultSchema },
    ]),
  ],
  controllers: [ScreeningController],
  providers: [ScreeningService],
  exports: [ScreeningService],
})
export class ScreeningModule {}
