import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import type { Role } from './users.types';

@Injectable()
export class RolesService {
   public constructor(private readonly prismaService: PrismaService) {}

   public async findRoles(): Promise<Role[]> {
      const roles = await this.prismaService.role.findMany({
         select: {
            id: true,
            name: true,
            description: true,
            isSystem: true,
         },
         orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
      });

      return roles;
   }
}
