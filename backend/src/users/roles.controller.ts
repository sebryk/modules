import { Controller, Get } from '@nestjs/common';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import type { Role } from './users.types';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
   public constructor(private readonly rolesService: RolesService) {}

   @Get()
   @RequirePermission('role:read')
   public async findRoles(): Promise<{ data: Role[] }> {
      const roles = await this.rolesService.findRoles();

      return { data: roles };
   }
}
