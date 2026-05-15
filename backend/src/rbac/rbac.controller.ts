import {
   Body,
   Controller,
   Get,
   Param,
   ParseUUIDPipe,
   Patch,
   Post,
   Query,
   Req,
} from '@nestjs/common';

import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import type { AuthenticatedRequest } from '../common/types/api';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import type { Role } from './rbac.types';
import { RbacService } from './rbac.service';

@Controller('roles')
export class RbacController {
   public constructor(private readonly rbacService: RbacService) {}

   @Get()
   @RequirePermission('role:read')
   public async findRoles(
      @Query('include') include?: string,
   ): Promise<{ data: Role[] }> {
      const queries = include?.split(',') ?? [];
      const roles = await this.rbacService.findRoles({
         withPermissions: queries.includes('permissions'),
      });

      return { data: roles };
   }

   @Post()
   @RequirePermission('role:create')
   public async createRole(
      @Body() createRoleDto: CreateRoleDto,
      @Req() request: AuthenticatedRequest,
   ): Promise<{ data: Role }> {
      const role = await this.rbacService.createRole(
         request.user.id,
         createRoleDto,
      );

      return { data: role };
   }

   @Patch(':id')
   @RequirePermission('role:update')
   public async updateRole(
      @Param('id', new ParseUUIDPipe()) id: string,
      @Body() updateRoleDto: UpdateRoleDto,
      @Req() request: AuthenticatedRequest,
   ): Promise<{ data: Role }> {
      const role = await this.rbacService.updateRole(
         request.user.id,
         id,
         updateRoleDto,
      );

      return { data: role };
   }
}
