import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation, ReservationDocument, ReservationStatus } from './reservation.schema';
import { RoomsService } from '../rooms/rooms.service';
import { CreateReservationDto, UpdateReservationDto } from './dto/reservation.dto';

const NIGHTS_MS = 24 * 60 * 60 * 1000;

export interface ReservationView {
  id: string;
  reference: string;
  room: {
    id: string;
    name: string;
    number: string;
    type: string;
    ratePerNight: number;
  };
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalCost: number;
  status: ReservationStatus;
  createdAt: string;
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    private rooms: RoomsService,
  ) {}

  private toView(doc: ReservationDocument, room: { id: string; name: string; number: string; type: string; ratePerNight: number }): ReservationView {
    const nights = Math.round((doc.checkOut.getTime() - doc.checkIn.getTime()) / NIGHTS_MS);
    return {
      id: String(doc._id),
      reference: doc.reference,
      room,
      guestName: doc.guestName,
      guestEmail: doc.guestEmail,
      guestPhone: doc.guestPhone,
      checkIn: doc.checkIn.toISOString().slice(0, 10),
      checkOut: doc.checkOut.toISOString().slice(0, 10),
      nights,
      guests: doc.guests,
      totalCost: doc.totalCost,
      status: doc.status,
      createdAt: doc.createdAt?.toISOString?.() ?? '',
    };
  }

  private async withRoomView(doc: ReservationDocument): Promise<ReservationView> {
    const room = await this.rooms.findById(String(doc.room));
    return this.toView(doc, {
      id: String(room._id),
      name: room.name,
      number: room.number,
      type: room.type,
      ratePerNight: room.ratePerNight,
    });
  }

  private generateReference(): string {
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return `RST-${code}`;
  }

  async create(userId: string, dto: CreateReservationDto): Promise<ReservationView> {
    const checkIn = new Date(`${dto.checkIn}T00:00:00.000Z`);
    const checkOut = new Date(`${dto.checkOut}T00:00:00.000Z`);
    if (checkOut <= checkIn) throw new BadRequestException('Check-out must be after check-in');
    const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / NIGHTS_MS);

    const room = await this.rooms.findById(dto.roomId);

    const availability = await this.rooms.available({ checkIn, checkOut, guests: dto.guests });
    if (!availability.some((r) => String(r._id) === String(room._id))) {
      throw new BadRequestException('This room is no longer available for those dates');
    }

    const totalCost = nights * room.ratePerNight;
    let reservation: ReservationDocument;
    try {
      reservation = await this.reservationModel.create({
        reference: this.generateReference(),
        user: new Types.ObjectId(userId),
        room: new Types.ObjectId(room._id as Types.ObjectId),
        guestName: dto.guestName,
        guestEmail: dto.guestEmail.toLowerCase(),
        guestPhone: dto.guestPhone ?? '',
        checkIn,
        checkOut,
        guests: dto.guests,
        totalCost,
        status: 'confirmed',
      });
    } catch (err) {
      if ((err as any)?.code === 11000) {
        throw new BadRequestException('This room was just booked by someone else. Please try different dates.');
      }
      throw err;
    }

    return this.withRoomView(reservation);
  }

  async list(query: { date?: string; status?: ReservationStatus; admin?: boolean; userId?: string }) {
    const filter: Record<string, unknown> = {};
    if (!query.admin && query.userId) filter.user = new Types.ObjectId(query.userId);
    if (query.status) filter.status = query.status;
    if (query.date) {
      const start = new Date(`${query.date}T00:00:00.000Z`);
      const end = new Date(start.getTime() + NIGHTS_MS);
      filter.checkIn = { $gte: start, $lt: end };
    }

    const docs = await this.reservationModel.find(filter).sort({ checkIn: 1 }).exec();
    const roomIds = [...new Set(docs.map((d) => String(d.room)))];
    const rooms = await Promise.all(roomIds.map((id) => this.rooms.findById(id)));
    const roomMap = new Map(rooms.map((r) => [String(r._id), r]));
    return docs.map((doc) => {
      const room = roomMap.get(String(doc.room))!;
      return this.toView(doc, {
        id: String(room._id),
        name: room.name,
        number: room.number,
        type: room.type,
        ratePerNight: room.ratePerNight,
      });
    });
  }

  async getById(id: string, userId: string, admin = false): Promise<ReservationView> {
    const doc = await this.reservationModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Reservation not found');
    if (!admin && String(doc.user) !== userId) {
      throw new ForbiddenException('Not your reservation');
    }
    return this.withRoomView(doc);
  }

  async update(id: string, dto: UpdateReservationDto, userId: string, admin = false): Promise<ReservationView> {
    const doc = await this.reservationModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Reservation not found');
    if (!admin && String(doc.user) !== userId) {
      throw new ForbiddenException('Not your reservation');
    }
    if (!admin && doc.status === 'cancelled') {
      throw new BadRequestException('Cancelled reservations cannot be edited');
    }

    const checkIn = dto.checkIn ? new Date(`${dto.checkIn}T00:00:00.000Z`) : doc.checkIn;
    const checkOut = dto.checkOut ? new Date(`${dto.checkOut}T00:00:00.000Z`) : doc.checkOut;
    const guests = dto.guests ?? doc.guests;
    if (checkOut <= checkIn) throw new BadRequestException('Check-out must be after check-in');

    const room = await this.rooms.findById(String(doc.room));
    const changedDates = dto.checkIn || dto.checkOut || dto.guests;
    if (changedDates) {
      const availability = await this.rooms.available({ checkIn, checkOut, guests });
      if (!availability.some((r) => String(r._id) === String(doc.room))) {
        throw new BadRequestException('The room is no longer available for those dates');
      }
    }

    const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / NIGHTS_MS);
    const patch: Record<string, unknown> = {
      checkIn,
      checkOut,
      guests,
      totalCost: nights * room.ratePerNight,
    };
    if (dto.guestName !== undefined) patch.guestName = dto.guestName;
    if (dto.guestPhone !== undefined) patch.guestPhone = dto.guestPhone;

    const updated = await this.reservationModel
      .findByIdAndUpdate(id, patch, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Reservation not found');
    return this.withRoomView(updated);
  }

  async setStatus(id: string, status: ReservationStatus, userId: string, admin = false): Promise<ReservationView> {
    const doc = await this.reservationModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Reservation not found');
    if (!admin) {
      if (status !== 'cancelled') {
        throw new ForbiddenException('Only the desk can change reservation status');
      }
      if (String(doc.user) !== userId) {
        throw new ForbiddenException('Not your reservation');
      }
    }
    doc.status = status;
    const saved = await doc.save();
    return this.withRoomView(saved);
  }

  async remove(id: string): Promise<void> {
    const doc = await this.reservationModel.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Reservation not found');
  }

  async metrics() {
    const [total, checkedIn, cancelled, revenueAgg, occupancy] = await Promise.all([
      this.reservationModel.countDocuments({ status: { $ne: 'cancelled' } }),
      this.reservationModel.countDocuments({ status: 'checked-in' }),
      this.reservationModel.countDocuments({ status: 'cancelled' }),
      this.reservationModel.aggregate([
        { $match: { status: { $in: ['confirmed', 'checked-in', 'checked-out'] } } },
        { $group: { _id: null, total: { $sum: '$totalCost' } } },
      ]),
      this.reservationModel.aggregate([
        { $match: { status: { $in: ['confirmed', 'checked-in'] } } },
        { $group: { _id: null, active: { $sum: 1 } } },
      ]),
    ]);
    const revenue = revenueAgg[0]?.total ?? 0;
    const activeNow = occupancy[0]?.active ?? 0;
    const totalRooms = await this.rooms.findAll({ includeInactive: true }).then((r) => r.length);
    return {
      totalBookings: total,
      checkedIn,
      cancelled,
      revenue,
      occupancyPercent:
        totalRooms > 0 ? Math.round((activeNow / totalRooms) * 100) : 0,
    };
  }
}
