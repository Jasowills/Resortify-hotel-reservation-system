export type RoomType = 'standard' | 'deluxe' | 'suite' | 'garden' | 'ocean';

export type ReservationStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';

export interface Room {
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

export interface Reservation {
  id: string;
  reference: string;
  room: {
    id: string;
    name: string;
    number: string;
    type: RoomType;
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'admin';
}

export interface Metrics {
  totalBookings: number;
  checkedIn: number;
  cancelled: number;
  revenue: number;
  occupancyPercent: number;
}
