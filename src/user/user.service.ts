import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, isValidObjectId } from 'mongoose';
import { User, UserDocument } from './user.model';
import { CreateUserDTO } from '../types';

const SALT_ROUNDS = 10;
const DUPLICATE_KEY_ERROR_CODE = 11000;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getUserById(id: string) {
    if (!isValidObjectId(id)) {
      return null;
    }
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

    try {
      return await this.userModel.create({
        ...createUserDto,
        password: hashedPassword,
      });
    } catch (error) {
      if ((error as { code?: number }).code === DUPLICATE_KEY_ERROR_CODE) {
        throw new ConflictException('User already registered, please login');
      }
      throw error;
    }
  }
}
