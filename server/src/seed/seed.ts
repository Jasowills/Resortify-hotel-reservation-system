import { Connection } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserSchema } from '../users/user.schema';
import { RoomSchema } from '../rooms/room.schema';
import { ReservationSchema } from '../reservations/reservation.schema';
import { ROOM_TYPES, RoomType } from '../rooms/room.schema';

const ROOMS: Array<{
  number: string;
  name: string;
  type: RoomType;
  capacity: number;
  ratePerNight: number;
  amenities: string[];
  description: string;
  tone: string;
}> = [
  { number: '101', name: 'The Atrium Room', type: 'standard', capacity: 2, ratePerNight: 180, amenities: ['King bed', 'Rain shower', 'Garden view', 'Desk'], description: 'A calm first-floor room looking onto the courtyard, with warm oak floors and a deep soaking shower.', tone: 'sand' },
  { number: '104', name: 'The Dune Room', type: 'standard', capacity: 2, ratePerNight: 210, amenities: ['Queen bed', 'Balcony', 'Reading chair', 'Nespresso'], description: 'Soft light, a small balcony, and nothing between you and the morning.', tone: 'brass' },
  { number: '202', name: 'The Grove Deluxe', type: 'deluxe', capacity: 3, ratePerNight: 280, amenities: ['King bed', 'Day bed', 'Garden terrace', 'Bath'], description: 'A corner room with a day bed, a claw-foot bath, and its own terrace among the palms.', tone: 'pine' },
  { number: '205', name: 'The Pine Deluxe', type: 'deluxe', capacity: 3, ratePerNight: 300, amenities: ['Two queens', 'Balcony', 'Sitting area', 'Smart TV'], description: 'A generously sized retreat for families, wrapped in pine and linen.', tone: 'ink' },
  { number: '301', name: 'The Atlantic Suite', type: 'suite', capacity: 4, ratePerNight: 480, amenities: ['Suite lounge', 'Ocean balcony', 'Bathtub', 'Butler service', 'Mini bar'], description: 'The flagship suite. Floor-to-ceiling windows, an ocean balcony, and a lounge for slow mornings.', tone: 'ocean' },
  { number: '304', name: 'The Dune Suite', type: 'suite', capacity: 4, ratePerNight: 440, amenities: ['Separate lounge', 'Balcony', 'Dining for four', 'Jacuzzi'], description: 'Room to spread out — a dining nook, a sunken bath, and sea breeze from both sides.', tone: 'sand' },
  { number: '402', name: 'The Garden House', type: 'garden', capacity: 5, ratePerNight: 380, amenities: ['Private garden', 'Outdoor shower', 'Fireplace', 'Kitchenette'], description: 'A standalone cottage with its own garden wall and an outdoor shower under the fig tree.', tone: 'pine' },
  { number: '501', name: 'The Cliff House', type: 'garden', capacity: 6, ratePerNight: 560, amenities: ['Two bedrooms', 'Private pool', 'Garden', 'Outdoor dining', 'Fireplace'], description: 'Perched above the cove — a full house with a plunge pool and a table set for six under the pergola.', tone: 'ocean' },
  { number: '201', name: 'The Horizon Ocean', type: 'ocean', capacity: 2, ratePerNight: 520, amenities: ['King bed', 'Ocean balcony', 'Bathtub', 'Turndown service'], description: 'The front row. Wake to the horizon, sleep to the tide.', tone: 'ocean' },
];

export async function seed(connection?: Connection) {
  const { default: mongoose } = await import('mongoose');
  const conn = connection ?? mongoose.connection;

  const UserModel = conn.model('User', UserSchema);
  const RoomModel = conn.model('Room', RoomSchema);
  const ReservationModel = conn.model('Reservation', ReservationSchema);

  if ((await UserModel.countDocuments()) === 0) {
    await UserModel.create([
      {
        name: 'Resortify Desk',
        email: 'admin@resortify.dev',
        passwordHash: await bcrypt.hash('AdminPass123!', 10),
        role: 'admin',
      },
      {
        name: 'Demo Guest',
        email: 'demo@resortify.dev',
        passwordHash: await bcrypt.hash('DemoPass123!', 10),
        role: 'guest',
      },
    ]);
  }

  if ((await RoomModel.countDocuments()) === 0) {
    await RoomModel.create(ROOMS);
  }

  const roomCount = await RoomModel.countDocuments();
  const reservationCount = await ReservationModel.countDocuments();
  if (reservationCount === 0 && roomCount > 0) {
    const all = await RoomModel.find().lean();
    const rooms = all.filter((r) => r.capacity >= 2);
    const today = new Date();
    const day = (offset: number) => {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() + offset);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    };
    const bookings = [
      { room: rooms[0], offset: 2, len: 3, name: 'Elena Marsh', guests: 2 },
      { room: rooms[1], offset: 5, len: 4, name: 'Theo Binder', guests: 2 },
      { room: rooms[2], offset: 0, len: 2, name: 'Aisha Cole', guests: 3 },
      { room: rooms[4], offset: 1, len: 5, name: 'Marco Vela', guests: 4 },
      { room: rooms[7], offset: -2, len: 3, name: 'Yusuf Ade', guests: 5 },
    ];
    const guest = await UserModel.findOne({ role: 'guest' }).lean();
    const reserve = (
      room: (typeof rooms)[number],
      offset: number,
      len: number,
      name: string,
      guests: number,
      status = 'confirmed',
    ) => {
      const checkIn = day(offset);
      const checkOut = day(offset + len);
      const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000);
      return ReservationModel.create({
        reference: `RST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        user: guest?._id,
        room: room._id,
        guestName: name,
        guestEmail: 'stays@resortify.dev',
        guestPhone: '+1 555 0100',
        checkIn,
        checkOut,
        guests,
        totalCost: nights * room.ratePerNight,
        status,
      });
    };
    await Promise.all(bookings.map((b) => reserve(b.room, b.offset, b.len, b.name, b.guests)));
  }

  const counts = {
    users: await UserModel.countDocuments(),
    rooms: await RoomModel.countDocuments(),
    reservations: await ReservationModel.countDocuments(),
  };
  console.log(`seed → ${JSON.stringify(counts)}`);
}

if (require.main === module) {
  const mongoose = require('mongoose') as typeof import('mongoose')['default'];
  mongoose.connect(process.env.MONGO_URI ?? 'mongodb://localhost:27017/resortify').then(async () => {
    await seed(mongoose.connection);
    await mongoose.disconnect();
  });
}
