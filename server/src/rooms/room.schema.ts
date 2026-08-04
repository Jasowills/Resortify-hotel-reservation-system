import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RoomType = 'standard' | 'deluxe' | 'suite' | 'garden' | 'ocean';
export const ROOM_TYPES: RoomType[] = ['standard', 'deluxe', 'suite', 'garden', 'ocean'];

export type RoomDocument = HydratedDocument<Room>;

@Schema({ timestamps: true })
export class Room {
  @Prop({ required: true, unique: true })
  number: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, enum: ROOM_TYPES, default: 'standard' })
  type: RoomType;

  @Prop({ required: true })
  capacity: number;

  @Prop({ required: true })
  ratePerNight: number;

  @Prop({ type: [String], default: [] })
  amenities: string[];

  @Prop({ trim: true, default: '' })
  description: string;

  /* which branded "art tile" the frontend shows for this room */
  @Prop({ type: String, default: 'pine' })
  tone: string;

  @Prop({ default: true })
  active: boolean;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
