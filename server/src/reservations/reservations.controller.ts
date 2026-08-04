import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationsService } from './reservations.service';
import {
  CreateReservationDto,
  ListReservationsQueryDto,
  ReservationStatusDto,
  UpdateReservationDto,
} from './dto/reservation.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('reservations')
@UseGuards(AuthGuard('jwt'))
export class ReservationsController {
  constructor(private reservations: ReservationsService) {}

  @Get()
  list(
    @Req() req: { user: { userId: string; role: string } },
    @Query() q: ListReservationsQueryDto,
  ) {
    const admin = req.user.role === 'admin';
    return this.reservations.list({
      date: q.date,
      status: q.status,
      admin,
      userId: req.user.userId,
    });
  }

  @Get('metrics')
  @UseGuards(RolesGuard)
  @Roles('admin')
  metrics() {
    return this.reservations.metrics();
  }

  @Post()
  create(@Req() req: { user: { userId: string } }, @Body() dto: CreateReservationDto) {
    return this.reservations.create(req.user.userId, dto);
  }

  @Get(':id')
  get(
    @Param('id') id: string,
    @Req() req: { user: { userId: string; role: string } },
  ) {
    return this.reservations.getById(id, req.user.userId, req.user.role === 'admin');
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReservationDto,
    @Req() req: { user: { userId: string; role: string } },
  ) {
    return this.reservations.update(id, dto, req.user.userId, req.user.role === 'admin');
  }

  @Put(':id/status')
  setStatus(
    @Param('id') id: string,
    @Body() dto: ReservationStatusDto,
    @Req() req: { user: { userId: string; role: string } },
  ) {
    return this.reservations.setStatus(id, dto.status, req.user.userId, req.user.role === 'admin');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.reservations.remove(id);
  }
}
