import { NotFoundException } from '@nestjs/common';

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
});
