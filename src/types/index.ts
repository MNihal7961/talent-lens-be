import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { UserRole } from '../user/user.model';

export class CreateUserDTO {
  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsString()
  lastName!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd',
    description: 'User password, minimum 6 characters',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class SignInDTO {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongP@ssw0rd', description: 'User password' })
  @IsString()
  password!: string;
}

export class UserResponseDTO {
  @ApiProperty({ example: '650f1b2e8f1b2c001c8e4a1a', description: 'User id' })
  _id!: string;

  @ApiProperty({ example: 'John' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role!: UserRole;

  @ApiProperty({ example: '2026-09-03T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-03T10:00:00.000Z' })
  updatedAt!: Date;
}

export class AuthResponseDTO {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTBmMWIyZ...',
    description: 'JWT access token',
  })
  accessToken!: string;

  @ApiProperty({ type: UserResponseDTO })
  user!: UserResponseDTO;
}

export class ErrorResponseDTO {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode!: number;

  @ApiProperty({
    description:
      'Error message. A single string for most errors, an array of strings for validation errors.',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'Wrong password',
  })
  message!: string | string[];

  @ApiProperty({ example: 'Bad Request', description: 'Error name' })
  error!: string;
}

export class EducationResponseDTO {
  @ApiProperty({ example: false })
  required!: boolean;

  @ApiProperty({ example: "Bachelor's" })
  degree!: string;

  @ApiProperty({ example: 'Computer Science or related field' })
  field!: string;
}

export class ExperienceResponseDTO {
  @ApiProperty({ example: 4 })
  minimumYears!: number;

  @ApiProperty({ example: 8 })
  maximumYears!: number;
}

export class JobPostResponseDTO {
  @ApiProperty({
    example: '650f1b2e8f1b2c001c8e4a1a',
    description: 'Job post id',
  })
  _id!: string;

  @ApiProperty({ example: 'Senior Backend Engineer' })
  title!: string;

  @ApiProperty({ example: 'We are looking for...' })
  description!: string;

  @ApiProperty({ type: [String], example: ['Node.js', 'TypeScript'] })
  requiredSkills!: string[];

  @ApiProperty({ type: [String], example: ['AWS', 'Docker'] })
  preferredSkills!: string[];

  @ApiProperty({
    type: [String],
    example: ['Design and build APIs', 'Mentor junior engineers'],
  })
  responsibilities!: string[];

  @ApiProperty({ type: EducationResponseDTO })
  education!: EducationResponseDTO;

  @ApiProperty({ type: ExperienceResponseDTO })
  experience!: ExperienceResponseDTO;

  @ApiProperty({
    example: '650f1b2e8f1b2c001c8e4a1a',
    description: 'Id of the user who created this job post',
  })
  createdBy!: string;

  @ApiProperty({ example: '2026-09-03T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-03T10:00:00.000Z' })
  updatedAt!: Date;
}

export class GenerateJobPostDTO {
  @ApiProperty({
    example:
      'We need a senior backend engineer with 5+ years of Node.js experience',
    description: 'Short description of the role to generate a job post from',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class EducationDTO {
  @ApiProperty({ example: false })
  @IsBoolean()
  required!: boolean;

  @ApiProperty({ example: "Bachelor's" })
  @IsString()
  degree!: string;

  @ApiProperty({ example: 'Computer Science or related field' })
  @IsString()
  field!: string;
}

export class ExperienceDTO {
  @ApiProperty({ example: 4 })
  @IsInt()
  minimumYears!: number;

  @ApiProperty({ example: 8 })
  @IsInt()
  maximumYears!: number;
}

export class CreateJobPostDTO {
  @ApiProperty({ example: 'Senior Backend Engineer' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'We are looking for...' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ type: [String], example: ['Node.js', 'TypeScript'] })
  @IsArray()
  @IsString({ each: true })
  requiredSkills!: string[];

  @ApiProperty({ type: [String], example: ['AWS', 'Docker'] })
  @IsArray()
  @IsString({ each: true })
  preferredSkills!: string[];

  @ApiProperty({
    type: [String],
    example: ['Design and build APIs', 'Mentor junior engineers'],
  })
  @IsArray()
  @IsString({ each: true })
  responsibilities!: string[];

  @ApiProperty({ type: EducationDTO })
  @ValidateNested()
  @Type(() => EducationDTO)
  education!: EducationDTO;

  @ApiProperty({ type: ExperienceDTO })
  @ValidateNested()
  @Type(() => ExperienceDTO)
  experience!: ExperienceDTO;
}

export class GeneratedJobPostResponseDTO {
  @ApiProperty({ example: 'Senior Backend Engineer' })
  title!: string;

  @ApiProperty({ example: 'We are looking for...' })
  description!: string;

  @ApiProperty({ type: [String], example: ['Node.js', 'TypeScript'] })
  requiredSkills!: string[];

  @ApiProperty({ type: [String], example: ['AWS', 'Docker'] })
  preferredSkills!: string[];

  @ApiProperty({
    type: [String],
    example: ['Design and build APIs', 'Mentor junior engineers'],
  })
  responsibilities!: string[];

  @ApiProperty({ type: EducationResponseDTO })
  education!: EducationResponseDTO;

  @ApiProperty({ type: ExperienceResponseDTO })
  experience!: ExperienceResponseDTO;
}

export class HealthResponseDTO {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: '2026-09-03T10:00:00.000Z' })
  timestamp!: string;
}
