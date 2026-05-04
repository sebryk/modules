import {
   Body,
   Controller,
   Get,
   HttpCode,
   HttpStatus,
   Post,
   Req,
   UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshJwtGuard } from './guards/refresh-jwt.guard';
import type { AuthTokens, MeResponse } from './auth.types';

type AuthenticatedRequest = FastifyRequest & {
   user: {
      id: string;
   };
};

@Controller('auth')
export class AuthController {
   public constructor(private readonly authService: AuthService) {}

   @Public()
   @Post('login')
   @HttpCode(HttpStatus.OK)
   public async login(@Body() loginDto: LoginDto): Promise<AuthTokens> {
      return this.authService.login(loginDto.email, loginDto.password);
   }

   @Public()
   @UseGuards(RefreshJwtGuard)
   @Post('refresh')
   @HttpCode(HttpStatus.OK)
   public async refresh(
      @Req() request: AuthenticatedRequest,
   ): Promise<Pick<AuthTokens, 'accessToken'>> {
      return this.authService.refresh(request.user.id);
   }

   @Get('me')
   public async getMe(
      @Req() request: AuthenticatedRequest,
   ): Promise<MeResponse> {
      return this.authService.getMe(request.user.id);
   }
}
