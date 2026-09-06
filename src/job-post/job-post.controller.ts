import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JobPostService } from './job-post.service';
import { CurrentUser, JwtPayload } from '../decorators/current-user.decorator';
import {
  CreateJobPostDTO,
  ErrorResponseDTO,
  GenerateJobPostDTO,
  GeneratedJobPostResponseDTO,
  JobPostResponseDTO,
} from '../types';

@ApiTags('JobPost')
@ApiBearerAuth()
@Controller('job-post')
export class JobPostController {
  constructor(private readonly jobPostService: JobPostService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate a job post draft from a short description using AI',
  })
  @ApiOkResponse({
    description: 'Generated job post draft',
    type: GeneratedJobPostResponseDTO,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ErrorResponseDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDTO,
  })
  @ApiResponse({
    status: 502,
    description: 'Failed to generate job post',
    type: ErrorResponseDTO,
  })
  async generate(@Body() generateJobPostDto: GenerateJobPostDTO) {
    return await this.jobPostService.genarteJobPost(generateJobPostDto.message);
  }

  @Post()
  @ApiOperation({ summary: 'Save a job post' })
  @ApiCreatedResponse({
    description: 'Job post saved',
    type: JobPostResponseDTO,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ErrorResponseDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDTO,
  })
  async save(
    @Body() createJobPostDto: CreateJobPostDTO,
    @CurrentUser() user: JwtPayload,
  ) {
    return await this.jobPostService.save(createJobPostDto, user._id);
  }

  @Get()
  @ApiOperation({ summary: 'List job posts created by the current user' })
  @ApiOkResponse({
    description: 'Job posts created by the current user',
    type: [JobPostResponseDTO],
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDTO,
  })
  async findAllByUserId(@CurrentUser() user: JwtPayload) {
    return await this.jobPostService.findAllByUserId(user._id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job post by id' })
  @ApiOkResponse({
    description: 'Job post',
    type: JobPostResponseDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'Job post not found',
    type: ErrorResponseDTO,
  })
  async findById(@Param('id') id: string) {
    const jobPost = await this.jobPostService.findById(id);
    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }
    return jobPost;
  }
}
