import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../decorators/public.decorator';
import { AuthResponseDTO, CreateUserDTO, ErrorResponseDTO, SignInDTO } from '../types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: AuthResponseDTO,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ErrorResponseDTO,
  })
  @ApiConflictResponse({
    description: 'User already registered, please login',
    type: ErrorResponseDTO,
  })
  signUp(@Body() createUserDto: CreateUserDTO) {
    return this.authService.signUp(createUserDto);
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({
    description: 'Signed in successfully',
    type: AuthResponseDTO,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ErrorResponseDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'User not found, or password is incorrect',
    type: ErrorResponseDTO,
  })
  signIn(@Body() signInDto: SignInDTO) {
    return this.authService.signIn(signInDto);
  }
}
