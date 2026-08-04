import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserDocument } from '../users/user.schema';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client | null;

  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    this.googleClient = clientId ? new OAuth2Client(clientId) : null;
  }

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

  async loginWithGoogle(credential: string) {
    if (!this.googleClient) {
      throw new BadRequestException('Google sign-in is not configured');
    }
    let payload: { email?: string; name?: string; sub?: string };
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: this.config.get<string>('GOOGLE_CLIENT_ID'),
      });
      payload = ticket.getPayload() as typeof payload;
    } catch {
      throw new UnauthorizedException('Invalid Google credential');
    }
    if (!payload?.email) {
      throw new UnauthorizedException('Google account has no email');
    }

    let user = await this.users.findByEmail(payload.email);
    if (!user) {
      const hash = await bcrypt.hash(crypto.randomUUID(), 10);
      user = await this.users.create({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        passwordHash: hash,
        role: 'guest',
      });
    }
    return { accessToken: this.tokenFor(user), user: this.publicUser(user) };
  }
}
