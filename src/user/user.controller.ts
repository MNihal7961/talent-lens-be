import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser, JwtPayload } from '../decorators/current-user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getCurrentUser(@CurrentUser() user: JwtPayload) {
    return this.userService.getUserById(user._id);
  }
}
