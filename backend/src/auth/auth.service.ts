import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { type User } from '@prisma/client';
import * as argon2 from 'argon2';
import type { SignOptions } from 'jsonwebtoken';

import { PrismaService } from '../prisma/prisma.service';
import { PASSWORD_HASH_OPTIONS } from './auth.constants';
import type { AuthTokens, MeResponse } from './auth.types';
import { PermissionsService } from './permissions.service';

@Injectable()
export class AuthService {
   public constructor(
      private readonly prismaService: PrismaService,
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
      private readonly permissionsService: PermissionsService,
   ) {}

   public async login(email: string, password: string): Promise<AuthTokens> {
      const user = await this.prismaService.user.findUnique({
         where: { email },
      });

      if (!user) {
         throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await argon2.verify(user.passwordHash, password, {
         ...PASSWORD_HASH_OPTIONS,
      });

      if (!isPasswordValid) {
         throw new UnauthorizedException('Invalid credentials');
      }

      return this.issueTokens(user);
   }

   public async refresh(
      userId: string,
   ): Promise<Pick<AuthTokens, 'accessToken'>> {
      const user = await this.prismaService.user.findUnique({
         where: { id: userId },
      });

      if (!user) {
         throw new UnauthorizedException('Invalid token');
      }

      const tokens = await this.issueTokens(user);

      return { accessToken: tokens.accessToken };
   }

   public async getMe(userId: string): Promise<MeResponse> {
      const user = await this.prismaService.user.findUnique({
         where: { id: userId },
         select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            position: true,
            createdAt: true,
         },
      });

      if (!user) {
         throw new UnauthorizedException('Invalid token');
      }

      const permissions =
         await this.permissionsService.getUserPermissions(userId);

      return {
         user,
         permissions: [...permissions].sort(),
      };
   }

   private async issueTokens(user: User): Promise<AuthTokens> {
      const payload = { sub: user.id };

      const accessSecret =
         this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
      const refreshSecret =
         this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
      const accessTtl = (this.configService.get<string>('JWT_ACCESS_TTL') ??
         '15m') as SignOptions['expiresIn'];
      const refreshTtl = (this.configService.get<string>('JWT_REFRESH_TTL') ??
         '7d') as SignOptions['expiresIn'];

      const [accessToken, refreshToken] = await Promise.all([
         this.jwtService.signAsync(payload, {
            secret: accessSecret,
            expiresIn: accessTtl,
         }),
         this.jwtService.signAsync(payload, {
            secret: refreshSecret,
            expiresIn: refreshTtl,
         }),
      ]);

      return {
         accessToken,
         refreshToken,
      };
   }
}
