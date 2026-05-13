import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { FastifyRequest } from 'fastify';

import { getRefreshTokenCookie } from '../auth-cookie';
import { JwtPayload } from '../auth.types';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
   Strategy,
   'jwt-refresh',
) {
   public constructor(configService: ConfigService) {
      super({
         jwtFromRequest: ExtractJwt.fromExtractors([
            (request: FastifyRequest | undefined) =>
               request ? getRefreshTokenCookie(request) : null,
         ]),
         ignoreExpiration: false,
         secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
   }

   public validate(payload: JwtPayload): { id: string } {
      return { id: payload.sub };
   }
}
