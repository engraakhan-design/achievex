import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../auth.types';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET') });
  }
  async validate(payload: AuthenticatedUser): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findFirst({ where: { id: payload.sub, organizationId: payload.organizationId, status: 'ACTIVE' }, select: { tokenVersion: true } });
    if (!user || user.tokenVersion !== payload.tokenVersion) throw new UnauthorizedException('Session is no longer valid');
    return payload;
  }
}
