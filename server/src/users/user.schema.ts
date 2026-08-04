import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserRole = 'guest' | 'admin';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ type: String, enum: ['guest', 'admin'], default: 'guest' })
  role: UserRole;

  @Prop({ default: true })
  active: boolean;

  createdAt?: Date;

  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
