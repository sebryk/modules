import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { PermissionsService } from './permissions.service';

@Module({
   imports: [
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.register({}),
   ],
   controllers: [AuthController],
   providers: [
      AuthService,
      PermissionsService,
      JwtStrategy,
      RefreshJwtStrategy,
   ],
   exports: [AuthService, PermissionsService],
})
export class AuthModule {}
