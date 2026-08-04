import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './user.schema';
import { NotFoundException, ConflictException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
    role?: UserRole;
  }): Promise<UserDocument> {
    const exists = await this.userModel.findOne({ email: data.email.toLowerCase() });
    if (exists) throw new ConflictException('An account with this email already exists');
    return this.userModel.create(data);
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  async updateRole(id: string, role: UserRole): Promise<UserDocument> {
    if (role !== 'admin') {
      const adminCount = await this.countAdmins();
      const target = await this.userModel.findById(id);
      if (target?.role === 'admin' && adminCount <= 1) {
        throw new ConflictException('Cannot demote the last admin');
      }
    }
    const user = await this.userModel.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async countAdmins(): Promise<number> {
    return this.userModel.countDocuments({ role: 'admin' });
  }

  async countGuests(): Promise<number> {
    return this.userModel.countDocuments({ role: 'guest' });
  }
}
