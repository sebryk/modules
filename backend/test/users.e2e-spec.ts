import { ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'

import { AppModule } from '../src/app.module'
import { registerCookiePlugin } from '../src/auth/auth-cookie'
import { PrismaService } from '../src/prisma/prisma.service'

const ADMIN_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const USER_ROLE_ID = '11111111-1111-4111-8111-111111111111'
const SUPPORT_ROLE_ID = '22222222-2222-4222-8222-222222222222'
const ROLE_PERMISSION_ID = '33333333-3333-4333-8333-333333333333'
const SYSTEM_ROLE_ID = '44444444-4444-4444-8444-444444444444'
const TARGET_USER_ID = '55555555-5555-4555-8555-555555555555'

const buildPrismaMock = () => ({
   user: {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
   },
   role: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
   },
   permission: {
      findMany: jest.fn(),
   },
   roleAssignment: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
   },
   rolePermission: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
   },
   $transaction: jest.fn(),
})

const buildPermissions = (permissions: string[]) =>
   permissions.map((permission) => {
      const [resource, action] = permission.split(':')

      return {
         resource,
         action,
      }
   })

describe('Users management', () => {
   let app: NestFastifyApplication
   let prismaMock: ReturnType<typeof buildPrismaMock>
   let jwtService: JwtService
   let createdUserData: {
      email: string
      firstName: string
      lastName: string
      position: string
      passwordHash: string
      status?: string
      avatarUrl?: string | null
   } | null

   beforeAll(() => {
      process.env.JWT_ACCESS_SECRET = 'test-access-secret'
      process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
      process.env.JWT_ACCESS_TTL = '15m'
      process.env.JWT_REFRESH_TTL = '7d'
   })

   beforeEach(async () => {
      prismaMock = buildPrismaMock()
      createdUserData = null

      const transactionContext = {
         user: prismaMock.user,
         role: prismaMock.role,
         roleAssignment: prismaMock.roleAssignment,
         rolePermission: prismaMock.rolePermission,
      }
      prismaMock.$transaction.mockImplementation(
         <TValue>(callback: (tx: typeof transactionContext) => Promise<TValue>) =>
            callback(transactionContext),
      )

      const moduleRef = await Test.createTestingModule({
         imports: [AppModule],
      })
         .overrideProvider(PrismaService)
         .useValue(prismaMock)
         .compile()

      app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
      await registerCookiePlugin(app)
      app.useGlobalPipes(
         new ValidationPipe({
            whitelist: true,
            transform: true,
         }),
      )
      await app.init()
      await app.getHttpAdapter().getInstance().ready()

      jwtService = app.get(JwtService)
   })

   afterEach(async () => {
      await app.close()
   })

   const createAccessToken = async (): Promise<string> =>
      jwtService.signAsync(
         { sub: ADMIN_ID },
         {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
         },
      )

   it('returns the first page with default pagination and safe user fields', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['user:read']))
      prismaMock.user.findMany.mockResolvedValue([
         {
            id: TARGET_USER_ID,
            email: 'ivan@example.com',
            firstName: 'Иван',
            lastName: 'Петров',
            position: 'Инженер',
            status: 'active',
            avatarUrl: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
         },
      ])
      prismaMock.user.count.mockResolvedValue(21)

      const response = await app.inject({
         method: 'GET',
         url: '/users',
         headers: { authorization: `Bearer ${await createAccessToken()}` },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({
         data: [
            {
               id: TARGET_USER_ID,
               email: 'ivan@example.com',
               firstName: 'Иван',
               lastName: 'Петров',
               position: 'Инженер',
               status: 'active',
               avatarUrl: null,
               createdAt: '2026-01-01T00:00:00.000Z',
            },
         ],
         meta: { page: 1, pageSize: 10, total: 21, totalPages: 3 },
      })
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
         where: {},
         select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            position: true,
            status: true,
            avatarUrl: true,
            createdAt: true,
         },
         orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
         skip: 0,
         take: 10,
      })
      expect(prismaMock.user.count).toHaveBeenCalledWith({ where: {} })
   })

   it('combines search, exact filters, sorting, includes and pagination', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['user:read']))
      prismaMock.user.count.mockResolvedValue(6)
      const query = new URLSearchParams({
         search: '  Иван   Петров  ',
         position: 'Инженер',
         status: 'vacation',
         sortBy: 'name',
         sortOrder: 'asc',
         page: '2',
         pageSize: '5',
         include: 'role-assignment',
      })

      const response = await app.inject({
         method: 'GET',
         url: `/users?${query.toString()}`,
         headers: { authorization: `Bearer ${await createAccessToken()}` },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({
         data: [],
         meta: { page: 2, pageSize: 5, total: 6, totalPages: 2 },
      })
      const where = {
         position: 'Инженер',
         status: 'vacation',
         AND: [
            {
               OR: [
                  { firstName: { contains: 'Иван', mode: 'insensitive' } },
                  { lastName: { contains: 'Иван', mode: 'insensitive' } },
                  { email: { contains: 'Иван', mode: 'insensitive' } },
                  { position: { contains: 'Иван', mode: 'insensitive' } },
               ],
            },
            {
               OR: [
                  { firstName: { contains: 'Петров', mode: 'insensitive' } },
                  { lastName: { contains: 'Петров', mode: 'insensitive' } },
                  { email: { contains: 'Петров', mode: 'insensitive' } },
                  { position: { contains: 'Петров', mode: 'insensitive' } },
               ],
            },
         ],
      }
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
         expect.objectContaining({
            where,
            orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }, { id: 'asc' }],
            skip: 5,
            take: 5,
         }),
      )
      expect(prismaMock.user.findMany.mock.calls).toHaveProperty(
         '0.0.select.roleAssignments.select.role.select',
         { id: true, name: true, description: true, isSystem: true },
      )
      expect(prismaMock.user.count).toHaveBeenCalledWith({ where })
   })

   it.each([
      'page=0',
      'page=-1',
      'page=1.5',
      'page=abc',
      'page=',
      'pageSize=0',
      'pageSize=101',
      'pageSize=2.5',
      'pageSize=abc',
      'status=unknown',
      'sortBy=passwordHash',
      'sortOrder=invalid',
      'search=a&search=b',
      'position=a&position=b',
      'include=a&include=b',
   ])('returns 400 for invalid list parameters: %s', async (query) => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['user:read']))

      const response = await app.inject({
         method: 'GET',
         url: `/users?${query}`,
         headers: { authorization: `Bearer ${await createAccessToken()}` },
      })

      expect(response.statusCode).toBe(400)
      expect(prismaMock.user.findMany).not.toHaveBeenCalled()
   })

   it('returns empty data and zero pages when there are no matches', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['user:read']))

      const response = await app.inject({
         method: 'GET',
         url: '/users?page=3',
         headers: { authorization: `Bearer ${await createAccessToken()}` },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({
         data: [],
         meta: { page: 3, pageSize: 10, total: 0, totalPages: 0 },
      })
   })

   it.each(['429496731', '4294967297', '9007199254740991'])(
      'does not query a wrapped Prisma offset for out-of-range page %s',
      async (page) => {
         prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['user:read']))
         prismaMock.user.count.mockResolvedValue(2)

         const response = await app.inject({
            method: 'GET',
            url: `/users?page=${page}`,
            headers: { authorization: `Bearer ${await createAccessToken()}` },
         })

         expect(response.statusCode).toBe(200)
         expect(response.json()).toEqual({
            data: [],
            meta: { page: Number(page), pageSize: 10, total: 2, totalPages: 1 },
         })
         expect(prismaMock.user.findMany).not.toHaveBeenCalled()
      },
   )

   it.each([
      ['john_doe', 'john\\_doe'],
      ['50%', '50\\%'],
      ['team\\reports', 'team\\\\reports'],
   ])('searches for the literal token %s', async (search, contains) => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['user:read']))
      prismaMock.user.count.mockResolvedValue(1)
      const query = new URLSearchParams({ search })

      const response = await app.inject({
         method: 'GET',
         url: `/users?${query.toString()}`,
         headers: { authorization: `Bearer ${await createAccessToken()}` },
      })

      expect(response.statusCode).toBe(200)
      expect(prismaMock.user.findMany.mock.calls).toHaveProperty('0.0.where.AND', [
         {
            OR: [
               { firstName: { contains, mode: 'insensitive' } },
               { lastName: { contains, mode: 'insensitive' } },
               { email: { contains, mode: 'insensitive' } },
               { position: { contains, mode: 'insensitive' } },
            ],
         },
      ])
   })

   it('returns 401 for a user list without authentication', async () => {
      const response = await app.inject({ method: 'GET', url: '/users' })

      expect(response.statusCode).toBe(401)
      expect(prismaMock.user.findMany).not.toHaveBeenCalled()
   })

   it('returns 403 for a user list without user:read', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['user:create']))

      const response = await app.inject({
         method: 'GET',
         url: '/users',
         headers: { authorization: `Bearer ${await createAccessToken()}` },
      })

      expect(response.statusCode).toBe(403)
      expect(prismaMock.user.findMany).not.toHaveBeenCalled()
   })

   it.each([{}, { status: 'invited', avatarUrl: 'https://example.com/avatar.png' }])(
      'creates a user with assigned roles and profile fields %j',
      async (fields) => {
         prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['user:create']))
         prismaMock.user.findUnique.mockResolvedValue(null)
         prismaMock.role.findMany.mockResolvedValue([
            {
               id: USER_ROLE_ID,
               name: 'manager',
            },
         ])
         prismaMock.user.create.mockImplementation(
            ({
               data,
            }: {
               data: {
                  email: string
                  firstName: string
                  lastName: string
                  position: string
                  passwordHash: string
                  status?: string
                  avatarUrl?: string | null
               }
            }) => {
               createdUserData = data

               return {
                  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
                  email: 'new.user@example.com',
                  firstName: 'New',
                  lastName: 'User',
                  position: 'Manager',
                  status: data.status ?? 'active',
                  avatarUrl: data.avatarUrl ?? null,
                  createdAt: new Date('2024-01-01T00:00:00.000Z'),
               }
            },
         )
         prismaMock.roleAssignment.createMany.mockResolvedValue({
            count: 1,
         })

         const accessToken = await createAccessToken()
         const response = await app.inject({
            method: 'POST',
            url: '/users',
            headers: {
               authorization: `Bearer ${accessToken}`,
            },
            payload: {
               email: 'new.user@example.com',
               password: 'ChangeMe123!',
               firstName: 'New',
               lastName: 'User',
               position: 'Manager',
               roleIds: [USER_ROLE_ID],
               ...fields,
            },
         })

         expect(response.statusCode).toBe(201)
         expect(JSON.parse(response.body)).toEqual({
            data: {
               id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
               email: 'new.user@example.com',
               firstName: 'New',
               lastName: 'User',
               position: 'Manager',
               status: fields.status ?? 'active',
               avatarUrl: fields.avatarUrl ?? null,
               createdAt: '2024-01-01T00:00:00.000Z',
               roleAssignments: [
                  {
                     grantedBy: ADMIN_ID,
                     createdAt: '2024-01-01T00:00:00.000Z',
                     role: {
                        id: USER_ROLE_ID,
                        name: 'manager',
                     },
                  },
               ],
            },
         })
         expect(prismaMock.roleAssignment.createMany).toHaveBeenCalledWith({
            data: [
               {
                  userId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
                  roleId: USER_ROLE_ID,
                  grantedBy: ADMIN_ID,
               },
            ],
         })
         expect(createdUserData).toMatchObject({
            email: 'new.user@example.com',
            firstName: 'New',
            lastName: 'User',
            position: 'Manager',
            ...fields,
         })
         expect(createdUserData?.passwordHash).toEqual(expect.any(String))
         expect(createdUserData?.passwordHash).not.toBe('ChangeMe123!')
      },
   )

   it.each([
      ['name', 'asc', [{ firstName: 'asc' }, { lastName: 'asc' }, { id: 'asc' }]],
      ['name', 'desc', [{ firstName: 'desc' }, { lastName: 'desc' }, { id: 'asc' }]],
      ['position', 'asc', [{ position: 'asc' }, { id: 'asc' }]],
      ['position', 'desc', [{ position: 'desc' }, { id: 'asc' }]],
      ['email', 'asc', [{ email: 'asc' }, { id: 'asc' }]],
      ['email', 'desc', [{ email: 'desc' }, { id: 'asc' }]],
      ['status', 'asc', [{ status: 'asc' }, { id: 'asc' }]],
      ['status', 'desc', [{ status: 'desc' }, { id: 'asc' }]],
      ['createdAt', 'asc', [{ createdAt: 'asc' }, { id: 'asc' }]],
      ['createdAt', 'desc', [{ createdAt: 'desc' }, { id: 'asc' }]],
   ])('sorts users by %s %s with a stable tie breaker', async (sortBy, sortOrder, orderBy) => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['user:read']))
      prismaMock.user.count.mockResolvedValue(1)

      const response = await app.inject({
         method: 'GET',
         url: `/users?sortBy=${String(sortBy)}&sortOrder=${String(sortOrder)}`,
         headers: { authorization: `Bearer ${await createAccessToken()}` },
      })

      expect(response.statusCode).toBe(200)
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy }))
   })

   it('ignores whitespace-only search', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['user:read']))
      prismaMock.user.count.mockResolvedValue(2)

      const response = await app.inject({
         method: 'GET',
         url: '/users?search=%20%20&pageSize=100',
         headers: { authorization: `Bearer ${await createAccessToken()}` },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({
         data: [],
         meta: { page: 1, pageSize: 100, total: 2, totalPages: 1 },
      })
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
         expect.objectContaining({ where: {}, skip: 0, take: 100 }),
      )
   })

   it('returns 403 when user:create permission is missing', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['application:read']))

      const accessToken = await createAccessToken()
      const response = await app.inject({
         method: 'POST',
         url: '/users',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            email: 'new.user@example.com',
            password: 'ChangeMe123!',
            firstName: 'New',
            lastName: 'User',
            position: 'Manager',
            roleIds: [USER_ROLE_ID],
         },
      })

      expect(response.statusCode).toBe(403)
   })

   it('returns 409 for duplicate email', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['user:create']))
      prismaMock.user.findUnique.mockResolvedValue({
         id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      })

      const accessToken = await createAccessToken()
      const response = await app.inject({
         method: 'POST',
         url: '/users',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            email: 'existing.user@example.com',
            password: 'ChangeMe123!',
            firstName: 'Existing',
            lastName: 'User',
            position: 'Manager',
            roleIds: [USER_ROLE_ID],
         },
      })

      expect(response.statusCode).toBe(409)
      expect(JSON.parse(response.body)).toEqual({
         message: 'User with this email already exists',
         error: 'Conflict',
         statusCode: 409,
      })
   })

   it('returns 400 for empty roleIds', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['user:create']))

      const accessToken = await createAccessToken()
      const response = await app.inject({
         method: 'POST',
         url: '/users',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            email: 'new.user@example.com',
            password: 'ChangeMe123!',
            firstName: 'New',
            lastName: 'User',
            position: 'Manager',
            roleIds: [],
         },
      })

      expect(response.statusCode).toBe(400)
   })

   it('returns 400 for unknown role ids', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['user:create']))
      prismaMock.user.findUnique.mockResolvedValue(null)
      prismaMock.role.findMany.mockResolvedValue([
         {
            id: USER_ROLE_ID,
            name: 'manager',
         },
      ])

      const accessToken = await createAccessToken()
      const response = await app.inject({
         method: 'POST',
         url: '/users',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            email: 'new.user@example.com',
            password: 'ChangeMe123!',
            firstName: 'New',
            lastName: 'User',
            position: 'Manager',
            roleIds: [USER_ROLE_ID, SUPPORT_ROLE_ID],
         },
      })

      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.body)).toEqual({
         message: 'One or more roles do not exist',
         error: 'Bad Request',
         statusCode: 400,
      })
   })

   it('updates a user with all mutable fields', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['user:update']))
      prismaMock.user.findUnique
         .mockResolvedValueOnce({
            id: TARGET_USER_ID,
         })
         .mockResolvedValueOnce({
            id: TARGET_USER_ID,
            email: 'updated.user@example.com',
            firstName: 'Updated',
            lastName: 'User',
            position: 'Director',
            status: 'active',
            avatarUrl: null,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            roleAssignments: [
               {
                  grantedBy: ADMIN_ID,
                  createdAt: new Date('2024-01-05T00:00:00.000Z'),
                  role: {
                     id: SUPPORT_ROLE_ID,
                     name: 'support',
                     description: 'Can support users',
                     isSystem: false,
                  },
               },
            ],
         })
      prismaMock.role.findMany.mockResolvedValue([
         {
            id: SUPPORT_ROLE_ID,
            name: 'support',
            description: 'Can support users',
            isSystem: false,
         },
      ])
      prismaMock.user.update.mockResolvedValue({
         id: TARGET_USER_ID,
      })
      prismaMock.roleAssignment.deleteMany.mockResolvedValue({ count: 1 })
      prismaMock.roleAssignment.createMany.mockResolvedValue({ count: 1 })

      const accessToken = await createAccessToken()
      const response = await app.inject({
         method: 'PUT',
         url: `/users/${TARGET_USER_ID}`,
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            email: 'updated.user@example.com',
            password: 'UpdatedPass123!',
            firstName: 'Updated',
            lastName: 'User',
            position: 'Director',
            roleIds: [SUPPORT_ROLE_ID],
         },
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.body)).toEqual({
         data: {
            id: TARGET_USER_ID,
            email: 'updated.user@example.com',
            firstName: 'Updated',
            lastName: 'User',
            position: 'Director',
            status: 'active',
            avatarUrl: null,
            createdAt: '2024-01-01T00:00:00.000Z',
            roleAssignments: [
               {
                  grantedBy: ADMIN_ID,
                  createdAt: '2024-01-05T00:00:00.000Z',
                  role: {
                     id: SUPPORT_ROLE_ID,
                     name: 'support',
                     description: 'Can support users',
                     isSystem: false,
                  },
               },
            ],
         },
      })
      expect(prismaMock.user.update).toHaveBeenCalledTimes(1)
      const [updateArgs] = prismaMock.user.update.mock.calls[0] as [
         {
            where: { id: string }
            data: {
               email: string
               firstName: string
               lastName: string
               position: string
               passwordHash: string
            }
            select: { id: boolean }
         },
      ]
      expect(updateArgs.where).toEqual({
         id: TARGET_USER_ID,
      })
      expect(updateArgs.data.email).toBe('updated.user@example.com')
      expect(updateArgs.data.firstName).toBe('Updated')
      expect(updateArgs.data.lastName).toBe('User')
      expect(updateArgs.data.position).toBe('Director')
      expect(typeof updateArgs.data.passwordHash).toBe('string')
      expect(updateArgs.data.passwordHash).not.toBe('UpdatedPass123!')
      expect(updateArgs.select).toEqual({
         id: true,
      })
      expect(prismaMock.roleAssignment.deleteMany).toHaveBeenCalledWith({
         where: {
            userId: TARGET_USER_ID,
         },
      })
      expect(prismaMock.roleAssignment.createMany).toHaveBeenCalledWith({
         data: [
            {
               userId: TARGET_USER_ID,
               roleId: SUPPORT_ROLE_ID,
               grantedBy: ADMIN_ID,
            },
         ],
      })
   })

   it('returns 403 when user:update permission is missing', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['user:read']))

      const accessToken = await createAccessToken()
      const response = await app.inject({
         method: 'PUT',
         url: `/users/${TARGET_USER_ID}`,
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            email: 'updated.user@example.com',
            password: 'UpdatedPass123!',
            firstName: 'Updated',
            lastName: 'User',
            position: 'Director',
            roleIds: [SUPPORT_ROLE_ID],
         },
      })

      expect(response.statusCode).toBe(403)
   })

   it('returns roles for a user with role:read permission', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['role:read']))
      prismaMock.role.findMany.mockResolvedValue([
         {
            id: USER_ROLE_ID,
            name: 'manager',
            description: 'Can manage users',
            isSystem: false,
         },
      ])

      const accessToken = await createAccessToken()
      const response = await app.inject({
         method: 'GET',
         url: '/roles',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.body)).toEqual({
         data: [
            {
               id: USER_ROLE_ID,
               name: 'manager',
               description: 'Can manage users',
               isSystem: false,
            },
         ],
      })
   })

   it('returns 403 when role:read permission is missing', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['application:read']))

      const accessToken = await createAccessToken()
      const response = await app.inject({
         method: 'GET',
         url: '/roles',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
      })

      expect(response.statusCode).toBe(403)
   })

   it('returns permissions when include=permissions is requested', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['role:read']))
      prismaMock.role.findMany.mockResolvedValue([
         {
            id: USER_ROLE_ID,
            name: 'manager',
            description: 'Can manage users',
            isSystem: false,
            rolePermissions: [
               {
                  permission: {
                     id: ROLE_PERMISSION_ID,
                     resource: 'user',
                     action: 'read',
                  },
               },
            ],
         },
      ])

      const accessToken = await createAccessToken()
      const response = await app.inject({
         method: 'GET',
         url: '/roles?include=permissions',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.body)).toEqual({
         data: [
            {
               id: USER_ROLE_ID,
               name: 'manager',
               description: 'Can manage users',
               isSystem: false,
               permissions: [
                  {
                     id: ROLE_PERMISSION_ID,
                     resource: 'user',
                     action: 'read',
                  },
               ],
            },
         ],
      })
   })

   it('creates a role for an authorized caller', async () => {
      prismaMock.permission.findMany
         .mockResolvedValueOnce(buildPermissions(['role:create']))
         .mockResolvedValueOnce([
            {
               id: ROLE_PERMISSION_ID,
               resource: 'user',
               action: 'read',
            },
         ])
      prismaMock.role.create.mockResolvedValue({
         id: USER_ROLE_ID,
         name: 'manager',
         description: 'Can manage users',
         isSystem: false,
      })
      prismaMock.rolePermission.createMany.mockResolvedValue({ count: 1 })

      const accessToken = await createAccessToken()
      const response = await app.inject({
         method: 'POST',
         url: '/roles',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            name: 'manager',
            description: 'Can manage users',
            permissionIds: [ROLE_PERMISSION_ID],
         },
      })

      expect(response.statusCode).toBe(201)
      expect(JSON.parse(response.body)).toEqual({
         data: {
            id: USER_ROLE_ID,
            name: 'manager',
            description: 'Can manage users',
            isSystem: false,
            permissions: [
               {
                  id: ROLE_PERMISSION_ID,
                  resource: 'user',
                  action: 'read',
               },
            ],
         },
      })
   })

   it('returns 403 when updating a system role without role:manage_system', async () => {
      prismaMock.permission.findMany
         .mockResolvedValueOnce(buildPermissions(['role:update']))
         .mockResolvedValueOnce(buildPermissions(['role:update']))
      prismaMock.role.findUnique.mockResolvedValue({
         id: SYSTEM_ROLE_ID,
         name: 'admin',
         description: 'System administrator',
         isSystem: true,
      })

      const accessToken = await createAccessToken()
      const response = await app.inject({
         method: 'PATCH',
         url: `/roles/${SYSTEM_ROLE_ID}`,
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            name: 'admin',
            description: 'Updated',
            permissionIds: [],
         },
      })

      expect(response.statusCode).toBe(403)
   })

   it('replaces roles for an existing user', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['role:assign']))
      prismaMock.user.findUnique
         .mockResolvedValueOnce({
            id: TARGET_USER_ID,
         })
         .mockResolvedValueOnce({
            id: TARGET_USER_ID,
            email: 'user@example.com',
            firstName: 'Test',
            lastName: 'User',
            position: 'Manager',
            status: 'active',
            avatarUrl: null,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            roleAssignments: [
               {
                  grantedBy: ADMIN_ID,
                  createdAt: new Date('2024-01-03T00:00:00.000Z'),
                  role: {
                     id: SUPPORT_ROLE_ID,
                     name: 'support',
                     description: 'Can support users',
                     isSystem: false,
                  },
               },
            ],
         })
      prismaMock.role.findMany.mockResolvedValue([
         {
            id: SUPPORT_ROLE_ID,
            name: 'support',
            description: 'Can support users',
            isSystem: false,
         },
      ])
      prismaMock.roleAssignment.deleteMany.mockResolvedValue({ count: 1 })
      prismaMock.roleAssignment.createMany.mockResolvedValue({ count: 1 })

      const accessToken = await createAccessToken()
      const response = await app.inject({
         method: 'PUT',
         url: `/users/${TARGET_USER_ID}/roles`,
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            roleIds: [SUPPORT_ROLE_ID],
         },
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.body)).toEqual({
         data: {
            id: TARGET_USER_ID,
            email: 'user@example.com',
            firstName: 'Test',
            lastName: 'User',
            position: 'Manager',
            status: 'active',
            avatarUrl: null,
            createdAt: '2024-01-01T00:00:00.000Z',
            roleAssignments: [
               {
                  grantedBy: ADMIN_ID,
                  createdAt: '2024-01-03T00:00:00.000Z',
                  role: {
                     id: SUPPORT_ROLE_ID,
                     name: 'support',
                     description: 'Can support users',
                     isSystem: false,
                  },
               },
            ],
         },
      })
   })
})
