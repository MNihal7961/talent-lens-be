import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, JwtPayload } from '../decorators/current-user.decorator';
import { ErrorResponseDTO } from '../types';
import { ScreeningService } from './screening.service';

@ApiTags('Screening')
@ApiBearerAuth()
@Controller('screening')
export class ScreeningController {
  constructor(private readonly screeningService: ScreeningService) {}

  @Post(':jobPostId')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('resume'))
  async screenResume(
    @Param('jobPostId') jobPostId: string,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() resume: Express.Multer.File,
  ) {
    return await this.screeningService.screenResume(
      jobPostId,
      user._id,
      resume,
    );
  }

  @Get('result/:jobApplicationId')
  @ApiOperation({ summary: 'Get the screening result for a job application' })
  @ApiOkResponse({ description: 'Screening result' })
  @ApiNotFoundResponse({
    description: 'Screening result not found',
    type: ErrorResponseDTO,
  })
  async getScreeningResultById(
    @Param('jobApplicationId') jobApplicationId: string,
  ) {
    const screeningResult =
      await this.screeningService.getScreeningResultByJobApplicationId(
        jobApplicationId,
      );
    if (!screeningResult) {
      throw new NotFoundException('Screening result not found');
    }
    return screeningResult;
  }
}
