import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsIn } from 'class-validator';
import { UsersService } from './users.service';
import { UserRole } from './user.schema';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

class UpdateRoleDto {
  @IsIn(['guest', 'admin'])
  role: UserRole;
}

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  list() {
    return this.users.findAll();
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.users.updateRole(id, dto.role);
  }
}
