import { BadRequestException, NotFoundException } from '@nestjs/common';

import { UsersService } from './users.service';

describe('UsersService', () => {
   it('returns nested role assignments in findAll', async () => {
      const prismaService = {
         user: {
            findMany: jest.fn().mockResolvedValue([
               {
                  id: 'user-1',
                  email: 'user@example.com',
                  firstName: 'Test',
                  lastName: 'User',
                  position: 'Manager',
                  createdAt: new Date('2024-01-01T00:00:00.000Z'),
                  roleAssignments: [
                     {
                        grantedBy: 'admin-1',
                        createdAt: new Date('2024-01-02T00:00:00.000Z'),
                        role: {
                           id: 'role-1',
                           name: 'manager',
                           description: 'Can manage users',
                           isSystem: false,
                        },
                     },
                  ],
               },
            ]),
            findUnique: jest.fn(),
         },
         role: {
            findMany: jest.fn(),
         },
         roleAssignment: {
            createMany: jest.fn(),
         },
         $transaction: jest.fn(),
      };

      const usersService = new UsersService(prismaService as never);

      await expect(usersService.findAll()).resolves.toEqual([
         {
            id: 'user-1',
            email: 'user@example.com',
            firstName: 'Test',
            lastName: 'User',
            position: 'Manager',
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            roleAssignments: [
               {
                  grantedBy: 'admin-1',
                  createdAt: new Date('2024-01-02T00:00:00.000Z'),
                  role: {
                     id: 'role-1',
                     name: 'manager',
                     description: 'Can manage users',
                     isSystem: false,
                  },
               },
            ],
         },
      ]);
   });

   it('throws NotFoundException when user is missing in findById', async () => {
      const prismaService = {
         user: {
            findMany: jest.fn(),
            findUnique: jest.fn().mockResolvedValue(null),
         },
         role: {
            findMany: jest.fn(),
         },
         roleAssignment: {
            createMany: jest.fn(),
         },
         $transaction: jest.fn(),
      };

      const usersService = new UsersService(prismaService as never);

      await expect(usersService.findById('missing-id')).rejects.toBeInstanceOf(
         NotFoundException,
      );
   });

   it('replaces roles for an existing user', async () => {
      const transactionContext = {
         roleAssignment: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
         },
      };
      const prismaService = {
         user: {
            findMany: jest.fn(),
            findUnique: jest
               .fn()
               .mockResolvedValueOnce({
                  id: 'user-1',
               })
               .mockResolvedValueOnce({
                  id: 'user-1',
                  email: 'user@example.com',
                  firstName: 'Test',
                  lastName: 'User',
                  position: 'Manager',
                  createdAt: new Date('2024-01-01T00:00:00.000Z'),
                  roleAssignments: [
                     {
                        grantedBy: 'admin-1',
                        createdAt: new Date('2024-01-03T00:00:00.000Z'),
                        role: {
                           id: 'role-2',
                           name: 'support',
                           description: 'Can support users',
                           isSystem: false,
                        },
                     },
                  ],
               }),
         },
         role: {
            findMany: jest.fn().mockResolvedValue([
               {
                  id: 'role-2',
                  name: 'support',
                  description: 'Can support users',
                  isSystem: false,
               },
            ]),
         },
         roleAssignment: transactionContext.roleAssignment,
         $transaction: jest.fn().mockImplementation(
            <
               TValue,
            >(
               callback: (
                  tx: typeof transactionContext,
               ) => Promise<TValue>,
            ) => callback(transactionContext),
         ),
      };

      const usersService = new UsersService(prismaService as never);

      await expect(
         usersService.replaceUserRoles('user-1', 'admin-1', {
            roleIds: ['role-2'],
         }),
      ).resolves.toEqual({
         id: 'user-1',
         email: 'user@example.com',
         firstName: 'Test',
         lastName: 'User',
         position: 'Manager',
         createdAt: new Date('2024-01-01T00:00:00.000Z'),
         roleAssignments: [
            {
               grantedBy: 'admin-1',
               createdAt: new Date('2024-01-03T00:00:00.000Z'),
               role: {
                  id: 'role-2',
                  name: 'support',
                  description: 'Can support users',
                  isSystem: false,
               },
            },
         ],
      });
      expect(prismaService.roleAssignment.deleteMany).toHaveBeenCalledWith({
         where: { userId: 'user-1' },
      });
      expect(prismaService.roleAssignment.createMany).toHaveBeenCalledWith({
         data: [
            {
               userId: 'user-1',
               roleId: 'role-2',
               grantedBy: 'admin-1',
            },
         ],
      });
   });

   it('fails role replacement when any role is missing', async () => {
      const prismaService = {
         user: {
            findMany: jest.fn(),
            findUnique: jest.fn().mockResolvedValue({
               id: 'user-1',
            }),
         },
         role: {
            findMany: jest.fn().mockResolvedValue([]),
         },
         roleAssignment: {
            createMany: jest.fn(),
            deleteMany: jest.fn(),
         },
         $transaction: jest.fn(),
      };

      const usersService = new UsersService(prismaService as never);

      await expect(
         usersService.replaceUserRoles('user-1', 'admin-1', {
            roleIds: ['role-1'],
         }),
      ).rejects.toBeInstanceOf(BadRequestException);
   });
});
