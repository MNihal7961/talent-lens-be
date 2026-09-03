import { Controller, Get, NotFoundException } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CurrentUser, JwtPayload } from '../decorators/current-user.decorator';
import { ErrorResponseDTO, UserResponseDTO } from '../types';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiOkResponse({
    description: 'Current user',
    type: UserResponseDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDTO,
  })
  @ApiNotFoundResponse({
    description: 'User no longer exists',
    type: ErrorResponseDTO,
  })
  async getCurrentUser(@CurrentUser() user: JwtPayload) {
    const currentUser = await this.userService.getUserById(user._id);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }
    return currentUser;
  }
}
