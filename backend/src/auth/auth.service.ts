import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { type User } from '@prisma/client'
import * as argon2 from 'argon2'
import type { SignOptions } from 'jsonwebtoken'

import { PrismaService } from '../prisma/prisma.service'
import { PermissionsService } from '../rbac/permissions.service'
import { PASSWORD_HASH_OPTIONS } from './auth.constants'
import type { AuthTokens, Me, TokenType } from './auth.types'

const DEFAULT_TOKEN_TTLS = {
   ACCESS: '15m',
   REFRESH: '7d',
} satisfies Record<TokenType, SignOptions['expiresIn']>

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
      })

      if (!user) {
         throw new UnauthorizedException('Invalid credentials')
      }

      const isPasswordValid = await argon2.verify(user.passwordHash, password, {
         ...PASSWORD_HASH_OPTIONS,
      })

      if (!isPasswordValid) {
         throw new UnauthorizedException('Invalid credentials')
      }

      const [accessToken, refreshToken] = await Promise.all([
         this.issueToken(user, 'ACCESS'),
         this.issueToken(user, 'REFRESH'),
      ])

      return {
         accessToken,
         refreshToken,
      }
   }

   public async refresh(userId: string): Promise<Pick<AuthTokens, 'accessToken'>> {
      const user = await this.prismaService.user.findUnique({
         where: { id: userId },
      })

      if (!user) {
         throw new UnauthorizedException('Invalid token')
      }

      return { accessToken: await this.issueToken(user, 'ACCESS') }
   }

   public async getMe(userId: string): Promise<Me> {
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
      })

      if (!user) {
         throw new UnauthorizedException('Invalid token')
      }

      const permissions = await this.permissionsService.getUserPermissions(userId)

      return {
         ...user,
         permissions: [...permissions].sort(),
      }
   }

   private async issueToken(user: User, type: TokenType): Promise<string> {
      const payload = { sub: user.id }
      const secret = this.configService.getOrThrow<string>(`JWT_${type}_SECRET`)
      const ttl = (this.configService.get<string>(`JWT_${type}_TTL`) ??
         DEFAULT_TOKEN_TTLS[type]) as SignOptions['expiresIn']

      return this.jwtService.signAsync(payload, { secret, expiresIn: ttl })
   }

   public getRefreshTokenTtl(): string {
      return this.configService.get<string>('JWT_REFRESH_TTL') ?? DEFAULT_TOKEN_TTLS.REFRESH
   }
}
