import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Room, RoomDocument, RoomType } from './room.schema';
import { CreateRoomDto } from './dto/room.dto';
import { ReservationDocument } from '../reservations/reservation.schema';

export interface AvailabilityInput {
  checkIn: Date;
  checkOut: Date;
  guests?: number;
  type?: RoomType;
}

export interface RoomView {
  id: string;
  number: string;
  name: string;
  type: RoomType;
  capacity: number;
  ratePerNight: number;
  amenities: string[];
  description: string;
  tone: string;
  active: boolean;
}

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel('Reservation') private reservationModel: Model<ReservationDocument>,
  ) {}

  toView(doc: RoomDocument): RoomView {
    return {
      id: String(doc._id),
      number: doc.number,
      name: doc.name,
      type: doc.type,
      capacity: doc.capacity,
      ratePerNight: doc.ratePerNight,
      amenities: doc.amenities ?? [],
      description: doc.description ?? '',
      tone: doc.tone ?? 'sand',
      active: doc.active ?? true,
    };
  }

  findAll(query: { type?: RoomType; includeInactive?: boolean } = {}) {
    const filter: Record<string, unknown> = {};
    if (query.type) filter.type = query.type;
    if (!query.includeInactive) filter.active = true;
    return this.roomModel.find(filter).sort({ ratePerNight: 1 }).exec();
  }

  async findById(id: string): Promise<RoomDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Room not found');
    const room = await this.roomModel.findById(id).exec();
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  create(dto: CreateRoomDto): Promise<RoomDocument> {
    return this.roomModel.create(dto);
  }

  async update(id: string, dto: Partial<CreateRoomDto>): Promise<RoomDocument> {
    const room = await this.roomModel.findByIdAndUpdate(id, dto, { new: true });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async remove(id: string): Promise<void> {
    const room = await this.roomModel.findByIdAndDelete(id);
    if (!room) throw new NotFoundException('Room not found');
  }

  /**
   * Rooms free across [checkIn, checkOut): no non-cancelled reservation for
   * the room overlaps the requested window, and capacity fits the party.
   */
  async available(input: AvailabilityInput): Promise<RoomDocument[]> {
    const filter: Record<string, unknown> = { active: true };
    if (input.type) filter.type = input.type;
    if (input.guests) filter.capacity = { $gte: input.guests };

    const candidateIds = await this.roomModel.find(filter).select('_id').lean();
    const candidates = candidateIds.map((c) => String(c._id));

    const conflicts = await this.reservationModel
      .find({
        room: { $in: candidates.map((id) => new Types.ObjectId(id)) },
        status: { $ne: 'cancelled' },
        checkIn: { $lt: input.checkOut },
        checkOut: { $gt: input.checkIn },
      })
      .distinct('room');

    const conflictIds = new Set(conflicts.map((c) => String(c)));
    const freeIds = candidates.filter((id) => !conflictIds.has(id));

    return this.roomModel.find({ _id: { $in: freeIds } }).sort({ ratePerNight: 1 }).exec();
  }
}
