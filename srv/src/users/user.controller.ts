import { UserService } from './users.service';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { UsersResponseDto } from './users.response.dto';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private userService: UserService) {}

  @Get()
  async getUsers(@Query() { limit, page }: { limit?: number; page?: number }) {
    this.logger.log(`Get users with limit ${limit || 'not defined'} on a page ${page || 'not defined'}`);
    const result = await this.userService.find(limit, page);
    return { users: result.users.map((user) => UsersResponseDto.fromUsersEntity(user)), count: result.count };
  }
}
