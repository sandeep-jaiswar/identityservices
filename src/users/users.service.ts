import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createOrUpdateUser(user: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ sub: user.sub });

    if (existingUser) {
      return await existingUser.save();
    } else {
      const newUser = new this.userModel(user);
      return await newUser.save();
    }
  }

  async getUserBySub(sub: string): Promise<User> {
    return await this.userModel.findOne({ sub }).exec();
  }
}
