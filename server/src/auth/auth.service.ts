import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserDocument } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  private publicUser(user: UserDocument) {
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  private tokenFor(user: UserDocument) {
    return this.jwt.sign({
      sub: String(user._id),
      email: user.email,
      role: user.role,
    });
  }

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      phone: dto.phone,
      role: 'guest',
    });
    return { accessToken: this.tokenFor(user), user: this.publicUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !user.active) throw new UnauthorizedException('Invalid email or password');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');
    return { accessToken: this.tokenFor(user), user: this.publicUser(user) };
  }

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }
}
