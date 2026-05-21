import type { Prisma } from '@prisma/client'
import { baseRoleSelect } from '../rbac/rbac.select'

export const userWithRolesSelect = {
   id: true,
   email: true,
   firstName: true,
   lastName: true,
   position: true,
   createdAt: true,
} satisfies Prisma.UserSelect

export const roleAssignmentsSelect = {
   roleAssignments: {
      select: {
         grantedBy: true,
         createdAt: true,
         role: {
            select: baseRoleSelect,
         },
      },
      orderBy: {
         role: {
            name: 'asc',
         },
      },
   },
} satisfies Prisma.UserSelect
