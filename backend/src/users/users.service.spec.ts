import { BadRequestException, NotFoundException } from '@nestjs/common'

import { UsersService } from './users.service'
import { FindUsersQueryDto } from './dto/find-users-query.dto'

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
                  status: 'active',
                  avatarUrl: null,
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
            count: jest.fn().mockResolvedValue(1),
            findUnique: jest.fn(),
         },
         role: {
            findMany: jest.fn(),
         },
         roleAssignment: {
            createMany: jest.fn(),
         },
         $transaction: jest.fn(),
      }

      const usersService = new UsersService(prismaService as never)

      await expect(
         usersService.findAll(
            Object.assign(new FindUsersQueryDto(), { include: 'role-assignment' }),
         ),
      ).resolves.toEqual({
         data: [
            {
               id: 'user-1',
               email: 'user@example.com',
               firstName: 'Test',
               lastName: 'User',
               position: 'Manager',
               status: 'active',
               avatarUrl: null,
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
         ],
         meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      })
   })

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
      }

      const usersService = new UsersService(prismaService as never)

      await expect(usersService.findById('missing-id')).rejects.toBeInstanceOf(NotFoundException)
   })

   it('replaces roles for an existing user', async () => {
      const transactionContext = {
         roleAssignment: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
         },
      }
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
                  status: 'active',
                  avatarUrl: null,
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
         $transaction: jest
            .fn()
            .mockImplementation(
               <TValue>(callback: (tx: typeof transactionContext) => Promise<TValue>) =>
                  callback(transactionContext),
            ),
      }

      const usersService = new UsersService(prismaService as never)

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
         status: 'active',
         avatarUrl: null,
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
      })
      expect(prismaService.roleAssignment.deleteMany).toHaveBeenCalledWith({
         where: { userId: 'user-1' },
      })
      expect(prismaService.roleAssignment.createMany).toHaveBeenCalledWith({
         data: [
            {
               userId: 'user-1',
               roleId: 'role-2',
               grantedBy: 'admin-1',
            },
         ],
      })
   })

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
      }

      const usersService = new UsersService(prismaService as never)

      await expect(
         usersService.replaceUserRoles('user-1', 'admin-1', {
            roleIds: ['role-1'],
         }),
      ).rejects.toBeInstanceOf(BadRequestException)
   })

   it.each<{ status?: 'vacation'; avatarUrl?: string | null }>([
      {},
      { status: 'vacation', avatarUrl: 'https://example.com/avatar.png' },
      { avatarUrl: null },
   ])('updates a user and replaces their roles with profile fields %j', async (fields) => {
      const transactionContext = {
         user: {
            update: jest.fn().mockResolvedValue({
               id: 'user-1',
            }),
         },
         roleAssignment: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
         },
      }
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
                  email: 'updated.user@example.com',
                  firstName: 'Updated',
                  lastName: 'User',
                  position: 'Director',
                  status: 'active',
                  avatarUrl: null,
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
         $transaction: jest
            .fn()
            .mockImplementation(
               <TValue>(callback: (tx: typeof transactionContext) => Promise<TValue>) =>
                  callback(transactionContext),
            ),
      }

      const usersService = new UsersService(prismaService as never)

      await expect(
         usersService.updateUser('user-1', 'admin-1', {
            email: 'updated.user@example.com',
            password: 'UpdatedPass123!',
            firstName: 'Updated',
            lastName: 'User',
            position: 'Director',
            roleIds: ['role-2'],
            ...fields,
         }),
      ).resolves.toEqual({
         id: 'user-1',
         email: 'updated.user@example.com',
         firstName: 'Updated',
         lastName: 'User',
         position: 'Director',
         status: 'active',
         avatarUrl: null,
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
      })
      expect(transactionContext.user.update).toHaveBeenCalledTimes(1)
      const [updateArgs] = transactionContext.user.update.mock.calls[0] as [
         {
            where: { id: string }
            data: {
               email: string
               firstName: string
               lastName: string
               position: string
               passwordHash: string
               status?: string
               avatarUrl?: string | null
            }
            select: { id: boolean }
         },
      ]
      expect(updateArgs.where).toEqual({
         id: 'user-1',
      })
      expect(updateArgs.data.email).toBe('updated.user@example.com')
      expect(updateArgs.data.firstName).toBe('Updated')
      expect(updateArgs.data.lastName).toBe('User')
      expect(updateArgs.data.position).toBe('Director')
      expect(updateArgs.data.status).toBe(fields.status)
      expect(updateArgs.data.avatarUrl).toBe(fields.avatarUrl)
      expect(typeof updateArgs.data.passwordHash).toBe('string')
      expect(updateArgs.data.passwordHash).not.toBe('UpdatedPass123!')
      expect(updateArgs.select).toEqual({
         id: true,
      })
      expect(transactionContext.roleAssignment.deleteMany).toHaveBeenCalledWith({
         where: { userId: 'user-1' },
      })
      expect(transactionContext.roleAssignment.createMany).toHaveBeenCalledWith({
         data: [
            {
               userId: 'user-1',
               roleId: 'role-2',
               grantedBy: 'admin-1',
            },
         ],
      })
   })
})
