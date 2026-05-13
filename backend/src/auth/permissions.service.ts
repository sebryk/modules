import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
   public constructor(private readonly prismaService: PrismaService) {}

   public async getUserPermissions(userId: string): Promise<Set<string>> {
      const permissions = await this.prismaService.permission.findMany({
         where: {
            rolePermissions: {
               some: {
                  role: {
                     roleAssignments: {
                        some: { userId },
                     },
                  },
               },
            },
         },
         select: {
            resource: true,
            action: true,
         },
      });

      return new Set(
         permissions.map(({ resource, action }) => `${resource}:${action}`),
      );
   }
}
