import 'dotenv/config'

import * as argon2 from 'argon2'
import { PrismaClient } from '@prisma/client'

import { PASSWORD_HASH_OPTIONS } from '../src/auth/auth.constants'
import { createPrismaClientOptions } from '../src/prisma/prisma-client-options'

const prisma = new PrismaClient(createPrismaClientOptions())

const systemPermissions = [
   'application:read',
   'application:create',
   'application:update',
   'application:delete',
   'application:update_status',
   'user:read',
   'user:create',
   'user:update',
   'user:delete',
   'role:read',
] as const satisfies readonly string[]

const seed = async (): Promise<void> => {
   const adminEmail = process.env.TEST_ADMIN_EMAIL
   const adminPassword = process.env.TEST_ADMIN_PASSWORD

   if (!adminEmail || !adminPassword) {
      throw new Error('TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD are required')
   }

   const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {
         description: 'Системный администратор',
         isSystem: true,
      },
      create: {
         name: 'admin',
         description: 'Системный администратор',
         isSystem: true,
      },
   })

   const permissions = await Promise.all(
      systemPermissions.map(async (permission) => {
         const [resource, action] = permission.split(':')

         return prisma.permission.upsert({
            where: {
               resource_action: {
                  resource,
                  action,
               },
            },
            update: {},
            create: {
               resource,
               action,
            },
         })
      }),
   )

   await Promise.all(
      permissions.map(async (permission) =>
         prisma.rolePermission.upsert({
            where: {
               roleId_permissionId: {
                  roleId: adminRole.id,
                  permissionId: permission.id,
               },
            },
            update: {},
            create: {
               roleId: adminRole.id,
               permissionId: permission.id,
            },
         }),
      ),
   )

   const passwordHash = await argon2.hash(adminPassword, PASSWORD_HASH_OPTIONS)

   const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
         firstName: 'Иван',
         lastName: 'Петров',
         position: 'Администратор',
         passwordHash,
      },
      create: {
         email: adminEmail,
         firstName: 'Иван',
         lastName: 'Петров',
         position: 'Администратор',
         passwordHash,
      },
   })

   await prisma.roleAssignment.upsert({
      where: {
         userId_roleId: {
            userId: adminUser.id,
            roleId: adminRole.id,
         },
      },
      update: {
         grantedBy: adminUser.id,
      },
      create: {
         userId: adminUser.id,
         roleId: adminRole.id,
         grantedBy: adminUser.id,
      },
   })
}

const main = async (): Promise<void> => {
   try {
      await seed()
   } finally {
      await prisma.$disconnect()
   }
}

void main()
