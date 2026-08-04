import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ROOM_TYPES, RoomType } from '../room.schema';

export class CreateRoomDto {
  @IsString()
  @MinLength(1)
  number: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsIn(ROOM_TYPES)
  type: RoomType;

  @IsInt()
  @Min(1)
  @Max(12)
  capacity: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  ratePerNight: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class AvailabilityQueryDto {
  @IsString()
  checkIn: string;

  @IsString()
  checkOut: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests?: number;

  @IsOptional()
  @IsIn(ROOM_TYPES)
  type?: RoomType;
}

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  number?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsIn(ROOM_TYPES)
  type?: RoomType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  ratePerNight?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
