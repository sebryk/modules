import type { Prisma } from '@prisma/client';

export const permissionSelect = {
   id: true,
   resource: true,
   action: true,
} satisfies Prisma.PermissionSelect;

export const baseRoleSelect = {
   id: true,
   name: true,
   description: true,
   isSystem: true,
} satisfies Prisma.RoleSelect;

export const rolePermissionsSelect = {
   rolePermissions: {
      select: {
         permission: {
            select: permissionSelect,
         },
      },
      orderBy: [
         {
            permission: {
               resource: 'asc',
            },
         },
         {
            permission: {
               action: 'asc',
            },
         },
      ],
   },
} satisfies Prisma.RoleSelect;
