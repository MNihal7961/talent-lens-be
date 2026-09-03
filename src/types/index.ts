import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { UserRole } from '../user/user.model';

export class CreateUserDTO {
  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'User email address' })
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
  @ApiProperty({ example: 'john.doe@example.com', description: 'User email address' })
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
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { type: 'string' } },
    ],
    example: 'Invalid credentials',
  })
  message!: string | string[];

  @ApiProperty({ example: 'Bad Request', description: 'Error name' })
  error!: string;
}

export class HealthResponseDTO {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: '2026-09-03T10:00:00.000Z' })
  timestamp!: string;
}
