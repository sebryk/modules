import {
   BadRequestException,
   ConflictException,
   ForbiddenException,
   NotFoundException,
} from '@nestjs/common';

import { RbacService } from './rbac.service';

describe('RbacService', () => {
   it('omits permissions unless requested', async () => {
      const prismaService = {
         role: {
            findMany: jest.fn().mockResolvedValue([
               {
                  id: 'role-1',
                  name: 'manager',
                  description: 'Can manage users',
                  isSystem: false,
               },
            ]),
         },
         permission: {
            findMany: jest.fn(),
         },
         rolePermission: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
         },
         $transaction: jest.fn(),
      };
      const permissionsService = {
         getUserPermissions: jest.fn(),
      };

      const rolesService = new RbacService(
         prismaService as never,
         permissionsService as never,
      );

      await expect(rolesService.findRoles()).resolves.toEqual([
         {
            id: 'role-1',
            name: 'manager',
            description: 'Can manage users',
            isSystem: false,
         },
      ]);
   });

   it('includes mapped permissions when requested', async () => {
      const prismaService = {
         role: {
            findMany: jest.fn().mockResolvedValue([
               {
                  id: 'role-1',
                  name: 'manager',
                  description: 'Can manage users',
                  isSystem: false,
                  rolePermissions: [
                     {
                        permission: {
                           id: 'perm-1',
                           resource: 'user',
                           action: 'read',
                        },
                     },
                  ],
               },
            ]),
         },
         permission: {
            findMany: jest.fn(),
         },
         rolePermission: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
         },
         $transaction: jest.fn(),
      };
      const permissionsService = {
         getUserPermissions: jest.fn(),
      };

      const rolesService = new RbacService(
         prismaService as never,
         permissionsService as never,
      );

      await expect(
         rolesService.findRoles({ withPermissions: true }),
      ).resolves.toEqual([
         {
            id: 'role-1',
            name: 'manager',
            description: 'Can manage users',
            isSystem: false,
            permissions: [
               {
                  id: 'perm-1',
                  resource: 'user',
                  action: 'read',
               },
            ],
         },
      ]);
   });

   it('creates a role with permission links', async () => {
      const createdRole = {
         id: 'role-1',
         name: 'manager',
         description: 'Can manage users',
         isSystem: false,
      };
      const tx = {
         role: {
            create: jest.fn().mockResolvedValue(createdRole),
         },
         rolePermission: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
         },
      };
      const prismaService = {
         role: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
         },
         permission: {
            findMany: jest.fn().mockResolvedValue([
               {
                  id: 'perm-1',
                  resource: 'user',
                  action: 'read',
               },
            ]),
         },
         rolePermission: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
         },
         $transaction: jest.fn().mockImplementation(
            <TValue>(callback: (prismaTx: typeof tx) => Promise<TValue>) =>
               callback(tx),
         ),
      };
      const permissionsService = {
         getUserPermissions: jest.fn(),
      };

      const rolesService = new RbacService(
         prismaService as never,
         permissionsService as never,
      );

      await expect(
         rolesService.createRole('actor-1', {
            name: 'manager',
            description: 'Can manage users',
            permissionIds: ['perm-1'],
         }),
      ).resolves.toEqual({
         id: 'role-1',
         name: 'manager',
         description: 'Can manage users',
         isSystem: false,
         permissions: [
            {
               id: 'perm-1',
               resource: 'user',
               action: 'read',
            },
         ],
      });
      expect(tx.rolePermission.createMany).toHaveBeenCalledWith({
         data: [
            {
               roleId: 'role-1',
               permissionId: 'perm-1',
            },
         ],
      });
   });

   it('fails when any permission is missing during role creation', async () => {
      const prismaService = {
         role: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
         },
         permission: {
            findMany: jest.fn().mockResolvedValue([]),
         },
         rolePermission: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
         },
         $transaction: jest.fn(),
      };
      const permissionsService = {
         getUserPermissions: jest.fn(),
      };

      const rolesService = new RbacService(
         prismaService as never,
         permissionsService as never,
      );

      await expect(
         rolesService.createRole('actor-1', {
            name: 'manager',
            description: 'Can manage users',
            permissionIds: ['perm-1'],
         }),
      ).rejects.toBeInstanceOf(BadRequestException);
   });

   it('replaces role permissions during update', async () => {
      const updatedRole = {
         id: 'role-1',
         name: 'manager',
         description: 'Updated',
         isSystem: false,
      };
      const tx = {
         rolePermission: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
         },
         role: {
            update: jest.fn().mockResolvedValue(updatedRole),
         },
      };
      const prismaService = {
         role: {
            findMany: jest.fn(),
            findUnique: jest
               .fn()
               .mockResolvedValueOnce({
                  id: 'role-1',
                  isSystem: false,
               }),
         },
         permission: {
            findMany: jest.fn().mockResolvedValue([
               {
                  id: 'perm-2',
                  resource: 'user',
                  action: 'update',
               },
            ]),
         },
         rolePermission: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
         },
         $transaction: jest.fn().mockImplementation(
            <TValue>(callback: (prismaTx: typeof tx) => Promise<TValue>) =>
               callback(tx),
         ),
      };
      const permissionsService = {
         getUserPermissions: jest.fn(),
      };

      const rolesService = new RbacService(
         prismaService as never,
         permissionsService as never,
      );

      await expect(
         rolesService.updateRole('actor-1', 'role-1', {
            name: 'manager',
            description: 'Updated',
            permissionIds: ['perm-2'],
         }),
      ).resolves.toEqual({
         id: 'role-1',
         name: 'manager',
         description: 'Updated',
         isSystem: false,
         permissions: [
            {
               id: 'perm-2',
               resource: 'user',
               action: 'update',
            },
         ],
      });
      expect(tx.rolePermission.deleteMany).toHaveBeenCalledWith({
         where: { roleId: 'role-1' },
      });
      expect(tx.rolePermission.createMany).toHaveBeenCalledWith({
         data: [
            {
               roleId: 'role-1',
               permissionId: 'perm-2',
            },
         ],
      });
   });

   it('fails when role is missing during update', async () => {
      const prismaService = {
         role: {
            findMany: jest.fn(),
            findUnique: jest.fn().mockResolvedValue(null),
         },
         permission: {
            findMany: jest.fn(),
         },
         rolePermission: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
         },
         $transaction: jest.fn(),
      };
      const permissionsService = {
         getUserPermissions: jest.fn(),
      };

      const rolesService = new RbacService(
         prismaService as never,
         permissionsService as never,
      );

      await expect(
         rolesService.updateRole('actor-1', 'missing-role', {
            name: 'manager',
            description: 'Updated',
            permissionIds: [],
         }),
      ).rejects.toBeInstanceOf(NotFoundException);
   });

   it('rejects system role creation without manage permission', async () => {
      const prismaService = {
         role: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
         },
         permission: {
            findMany: jest.fn(),
         },
         rolePermission: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
         },
         $transaction: jest.fn(),
      };
      const permissionsService = {
         getUserPermissions: jest.fn().mockResolvedValue(new Set()),
      };

      const rolesService = new RbacService(
         prismaService as never,
         permissionsService as never,
      );

      await expect(
         rolesService.createRole('actor-1', {
            name: 'system-manager',
            description: 'System role',
            permissionIds: [],
            isSystem: true,
         }),
      ).rejects.toBeInstanceOf(ForbiddenException);
   });

   it('surfaces duplicate role names as conflict', async () => {
      const prismaError = Object.assign(new Error('duplicate'), {
         code: 'P2002',
      });
      const prismaService = {
         role: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
         },
         permission: {
            findMany: jest.fn().mockResolvedValue([]),
         },
         rolePermission: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
         },
         $transaction: jest.fn().mockRejectedValue(prismaError),
      };
      const permissionsService = {
         getUserPermissions: jest.fn(),
      };

      const rolesService = new RbacService(
         prismaService as never,
         permissionsService as never,
      );

      await expect(
         rolesService.createRole('actor-1', {
            name: 'manager',
            description: 'Duplicate',
            permissionIds: [],
         }),
      ).rejects.toBeInstanceOf(ConflictException);
   });
});
