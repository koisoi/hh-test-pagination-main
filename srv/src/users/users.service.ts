import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UsersEntity)
    private usersRepo: Repository<UsersEntity>,
  ) {}

  // get list of all users
  async findAll(): Promise<UsersEntity[]> {
    return await this.usersRepo.find();
  }

  // get users with option of pagination
  async find(
    limit: number | undefined = undefined,
    page: number = 1,
  ): Promise<{ users: UsersEntity[]; count: number }> {
    const users = await this.usersRepo.find({
      skip: (page - 1) * (limit || 0),
      take: limit,
    });
    const count = await this.usersRepo.count();

    return {
      users,
      count,
    };
  }
}
