import {
   Body,
   Controller,
   Get,
   HttpCode,
   HttpStatus,
   Post,
   Req,
   Res,
   UseGuards,
} from '@nestjs/common'
import type { FastifyReply } from 'fastify'

import { clearRefreshTokenCookie, setRefreshTokenCookie } from './auth-cookie'
import { Public } from './decorators/public.decorator'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RefreshJwtGuard } from './guards/refresh-jwt.guard'
import type { AuthTokens, Me } from './auth.types'
import { AuthenticatedRequest } from '../common/types/api'

@Controller('auth')
export class AuthController {
   public constructor(private readonly authService: AuthService) {}

   @Public()
   @Post('login')
   @HttpCode(HttpStatus.OK)
   public async login(
      @Body() loginDto: LoginDto,
      @Res({ passthrough: true }) reply: FastifyReply,
   ): Promise<Pick<AuthTokens, 'accessToken'>> {
      const { accessToken, refreshToken } = await this.authService.login(
         loginDto.email,
         loginDto.password,
      )

      setRefreshTokenCookie(reply, refreshToken, this.authService.getRefreshTokenTtl())

      return { accessToken }
   }

   @Public()
   @UseGuards(RefreshJwtGuard)
   @Post('refresh')
   @HttpCode(HttpStatus.OK)
   public async refresh(
      @Req() request: AuthenticatedRequest,
   ): Promise<Pick<AuthTokens, 'accessToken'>> {
      return this.authService.refresh(request.user.id)
   }

   @Public()
   @Post('logout')
   @HttpCode(HttpStatus.OK)
   public logout(@Res({ passthrough: true }) reply: FastifyReply): {
      success: true
   } {
      clearRefreshTokenCookie(reply)

      return { success: true }
   }

   @Get('me')
   public async getMe(@Req() request: AuthenticatedRequest): Promise<Me> {
      return this.authService.getMe(request.user.id)
   }
}
