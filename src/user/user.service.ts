import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.model';
import { CreateUserDTO } from '../types';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  getUserById(id: string) {
    return this.userModel.findById(id).select('-password').exec();
  }

  getUserByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async createUser(createUserDto: CreateUserDTO) {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      SALT_ROUNDS,
    );
    return this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }
}
