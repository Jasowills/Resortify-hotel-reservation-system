import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReservationStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
export const RESERVATION_STATUSES: ReservationStatus[] = [
  'confirmed',
  'checked-in',
  'checked-out',
  'cancelled',
];

export type ReservationDocument = HydratedDocument<Reservation>;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ required: true, unique: true })
  reference: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  room: Types.ObjectId;

  @Prop({ required: true, trim: true })
  guestName: string;

  @Prop({ required: true, lowercase: true, trim: true })
  guestEmail: string;

  @Prop({ trim: true, default: '' })
  guestPhone: string;

  @Prop({ required: true })
  checkIn: Date;

  @Prop({ required: true })
  checkOut: Date;

  @Prop({ required: true, min: 1 })
  guests: number;

  @Prop({ required: true })
  totalCost: number;

  @Prop({ type: String, enum: RESERVATION_STATUSES, default: 'confirmed' })
  status: ReservationStatus;

  createdAt?: Date;

  updatedAt?: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
