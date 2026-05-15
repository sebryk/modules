import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { RbacModule } from '../rbac/rbac.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/jwt-refresh.strategy';

@Module({
   imports: [
      RbacModule,
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.register({}),
   ],
   controllers: [AuthController],
   providers: [AuthService, JwtStrategy, RefreshJwtStrategy],
   exports: [AuthService],
})
export class AuthModule {}
