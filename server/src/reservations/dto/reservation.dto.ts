import { Type } from 'class-transformer';
import { IsDateString, IsEmail, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { RESERVATION_STATUSES, ReservationStatus } from '../reservation.schema';

export class CreateReservationDto {
  @IsString()
  roomId: string;

  @IsString()
  guestName: string;

  @IsEmail()
  guestEmail: string;

  @IsOptional()
  @IsString()
  guestPhone?: string;

  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests: number;
}

export class UpdateReservationDto {
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests?: number;

  @IsOptional()
  @IsString()
  guestName?: string;

  @IsOptional()
  @IsString()
  guestPhone?: string;
}

export class ReservationStatusDto {
  @IsIn(RESERVATION_STATUSES)
  status: ReservationStatus;
}

export class ListReservationsQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsIn(RESERVATION_STATUSES)
  status?: ReservationStatus;
}
