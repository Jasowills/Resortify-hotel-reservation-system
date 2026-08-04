import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoomsService } from './rooms.service';
import { AvailabilityQueryDto, CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BadRequestException } from '@nestjs/common';

@Controller('rooms')
export class RoomsController {
  constructor(private rooms: RoomsService) {}

  @Get()
  async list(@Query('type') type?: string) {
    const docs = await this.rooms.findAll({ type: type as never });
    return docs.map((d) => this.rooms.toView(d));
  }

  @Get('available')
  async available(@Query() q: AvailabilityQueryDto) {
    const checkIn = new Date(`${q.checkIn}T00:00:00.000Z`);
    const checkOut = new Date(`${q.checkOut}T00:00:00.000Z`);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      throw new BadRequestException('Invalid dates');
    }
    if (checkOut <= checkIn) {
      throw new BadRequestException('Check-out must be after check-in');
    }
    const docs = await this.rooms.available({
      checkIn,
      checkOut,
      guests: q.guests,
      type: q.type,
    });
    return docs.map((d) => this.rooms.toView(d));
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.rooms.toView(await this.rooms.findById(id));
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateRoomDto) {
    return this.rooms.toView(await this.rooms.create(dto));
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.rooms.toView(await this.rooms.update(id, dto));
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.rooms.remove(id);
  }
}
