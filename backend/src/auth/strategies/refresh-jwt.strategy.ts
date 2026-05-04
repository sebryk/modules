import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
   sub: string;
};

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
   Strategy,
   'jwt-refresh',
) {
   public constructor(configService: ConfigService) {
      super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         ignoreExpiration: false,
         secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
   }

   public validate(payload: JwtPayload): { id: string } {
      return { id: payload.sub };
   }
}
