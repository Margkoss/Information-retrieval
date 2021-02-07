import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User, UserDto } from './users.model';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  public async getUsers(): Promise<UserDto[]> {
    return await this.userService.getUsers();
  }

  @Post('/add-missing-ratings')
  public async addMissingRatings() {
    return await this.userService.addMissingRatings();
  }

  @Post('/create-from-ratings')
  public async createUsers() {
    return await this.userService.createUsersFromRatings();
  }
}
