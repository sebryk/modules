import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
   public constructor(private readonly prismaService: PrismaService) {}

   public async getUserPermissions(userId: string): Promise<Set<string>> {
      const roleAssignments = await this.prismaService.roleAssignment.findMany({
         where: {
            userId,
         },
         select: {
            role: {
               select: {
                  rolePermissions: {
                     select: {
                        permission: {
                           select: {
                              resource: true,
                              action: true,
                           },
                        },
                     },
                  },
               },
            },
         },
      });

      const permissions = new Set<string>();

      for (const assignment of roleAssignments) {
         for (const rolePermission of assignment.role.rolePermissions) {
            const { resource, action } = rolePermission.permission;
            permissions.add(`${resource}:${action}`);
         }
      }

      return permissions;
   }
}
