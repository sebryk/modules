import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import type {
   CreateUserResponse,
   RolesListResponse,
} from './users.types';

type AuthenticatedRequest = FastifyRequest & {
   user: {
      id: string;
   };
};

@Controller()
export class UsersController {
   public constructor(private readonly usersService: UsersService) {}

   @Post('users')
   @RequirePermission('user:create')
   public async create(
      @Body() createUserDto: CreateUserDto,
      @Req() request: AuthenticatedRequest,
   ): Promise<CreateUserResponse> {
      return this.usersService.createUser(request.user.id, createUserDto);
   }

   @Get('roles')
   @RequirePermission('role:read')
   public async findRoles(): Promise<RolesListResponse> {
      const items = await this.usersService.findRoles();

      return { items };
   }
}
