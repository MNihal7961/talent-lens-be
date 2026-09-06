import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { databaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PresenceModule } from './presence/presence.module';
import { JobPostModule } from './job-post/job-post.module';
import { ResumeModule } from './resume/resume.module';
import { JobApplicationModule } from './job-application/job-application.module';
import { ScreeningModule } from './screening/screening.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),
    AuthModule,
    UserModule,
    PresenceModule,
    JobPostModule,
    ResumeModule,
    JobApplicationModule,
    ScreeningModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
