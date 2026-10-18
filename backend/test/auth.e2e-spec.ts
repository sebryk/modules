import * as argon2 from 'argon2'
import { ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'

import { AppModule } from '../src/app.module'
import { registerCookiePlugin } from '../src/auth/auth-cookie'
import { PASSWORD_HASH_OPTIONS } from '../src/auth/auth.constants'
import { PrismaService } from '../src/prisma/prisma.service'

const buildPrismaMock = () => ({
   application: {
      findMany: jest.fn(),
   },
   permission: {
      findMany: jest.fn(),
   },
   user: {
      findUnique: jest.fn(),
   },
})

const buildPermissions = (permissions: string[]) =>
   permissions.map((permission) => {
      const [resource, action] = permission.split(':')

      return {
         resource,
         action,
      }
   })

const isAccessTokenResponse = (value: unknown): value is { accessToken: string } =>
   typeof value === 'object' &&
   value !== null &&
   'accessToken' in value &&
   typeof value.accessToken === 'string'

describe('Auth RBAC', () => {
   let app: NestFastifyApplication
   let prismaMock: ReturnType<typeof buildPrismaMock>
   let jwtService: JwtService
   let passwordHash: string

   beforeAll(async () => {
      process.env.JWT_ACCESS_SECRET = 'test-access-secret'
      process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
      process.env.JWT_ACCESS_TTL = '15m'
      process.env.JWT_REFRESH_TTL = '7d'
      passwordHash = await argon2.hash('ChangeMe123!', PASSWORD_HASH_OPTIONS)
   })

   beforeEach(async () => {
      prismaMock = buildPrismaMock()

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

   it('returns access token in body and refresh token in cookie on successful login', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
         id: 'user-1',
         email: 'admin@example.com',
         passwordHash,
         createdAt: new Date('2024-01-01T00:00:00.000Z'),
      })

      const response = await app.inject({
         method: 'POST',
         url: '/auth/login',
         payload: {
            email: 'admin@example.com',
            password: 'ChangeMe123!',
         },
      })

      expect(response.statusCode).toBe(200)
      const responseBody: unknown = JSON.parse(response.body)

      expect(isAccessTokenResponse(responseBody)).toBe(true)
      expect(response.cookies).toEqual(
         expect.arrayContaining([
            expect.objectContaining({
               name: 'refreshToken',
               httpOnly: true,
            }),
         ]),
      )
   })

   it('returns 401 for invalid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
         id: 'user-1',
         email: 'admin@example.com',
         passwordHash,
         createdAt: new Date('2024-01-01T00:00:00.000Z'),
      })

      const response = await app.inject({
         method: 'POST',
         url: '/auth/login',
         payload: {
            email: 'admin@example.com',
            password: 'WrongPassword123!',
         },
      })

      expect(response.statusCode).toBe(401)
   })

   it('returns current user and permissions on /auth/me', async () => {
      prismaMock.user.findUnique.mockImplementation(
         ({ where }: { where: { id?: string; email?: string } }) => {
            if (where.email === 'admin@example.com') {
               return {
                  id: 'user-1',
                  email: 'admin@example.com',
                  passwordHash,
                  createdAt: new Date('2024-01-01T00:00:00.000Z'),
               }
            }

            if (where.id === 'user-1') {
               return {
                  id: 'user-1',
                  email: 'admin@example.com',
                  firstName: 'System',
                  lastName: 'Administrator',
                  position: 'Administrator',
                  status: 'active',
                  avatarUrl: null,
                  createdAt: new Date('2024-01-01T00:00:00.000Z'),
               }
            }

            return null
         },
      )
      prismaMock.permission.findMany.mockResolvedValue(
         buildPermissions(['application:create', 'application:read']),
      )

      const accessToken = await jwtService.signAsync(
         { sub: 'user-1' },
         {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
         },
      )

      const response = await app.inject({
         method: 'GET',
         url: '/auth/me',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({
         data: {
            id: 'user-1',
            email: 'admin@example.com',
            firstName: 'System',
            lastName: 'Administrator',
            position: 'Administrator',
            status: 'active',
            avatarUrl: null,
            createdAt: '2024-01-01T00:00:00.000Z',
            permissions: ['application:create', 'application:read'],
         },
      })
      expect(prismaMock.user.findUnique).toHaveBeenLastCalledWith({
         where: { id: 'user-1' },
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
      })
   })

   it('returns 401 for missing access token', async () => {
      const response = await app.inject({
         method: 'GET',
         url: '/auth/me',
      })

      expect(response.statusCode).toBe(401)
   })

   it('returns 403 when permission is missing', async () => {
      prismaMock.permission.findMany.mockResolvedValue([])

      const accessToken = await jwtService.signAsync(
         { sub: 'user-1' },
         {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
         },
      )

      const response = await app.inject({
         method: 'GET',
         url: '/applications',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
      })

      expect(response.statusCode).toBe(403)
   })

   it('allows protected endpoint when permission exists', async () => {
      prismaMock.permission.findMany.mockResolvedValue(buildPermissions(['application:read']))
      prismaMock.application.findMany.mockResolvedValue([
         {
            id: 'application-1',
            title: 'Application title',
            description: 'Application description',
            status: 'NEW',
            createdBy: 'user-1',
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-01-01T00:00:00.000Z'),
         },
      ])

      const accessToken = await jwtService.signAsync(
         { sub: 'user-1' },
         {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
         },
      )

      const response = await app.inject({
         method: 'GET',
         url: '/applications',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({
         data: [
            {
               id: 'application-1',
               title: 'Application title',
               description: 'Application description',
               status: 'NEW',
               createdBy: 'user-1',
               createdAt: '2024-01-01T00:00:00.000Z',
               updatedAt: '2024-01-01T00:00:00.000Z',
            },
         ],
      })
   })

   it('refreshes an access token with a refresh token', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
         id: 'user-1',
         email: 'admin@example.com',
         passwordHash,
         createdAt: new Date('2024-01-01T00:00:00.000Z'),
      })

      const response = await app.inject({
         method: 'POST',
         url: '/auth/refresh',
         headers: {
            cookie: [
               `refreshToken=${await jwtService.signAsync(
                  { sub: 'user-1' },
                  {
                     secret: process.env.JWT_REFRESH_SECRET,
                     expiresIn: '7d',
                  },
               )}`,
            ].join('; '),
         },
      })

      expect(response.statusCode).toBe(200)
      const responseBody: unknown = JSON.parse(response.body)

      expect(isAccessTokenResponse(responseBody)).toBe(true)
   })

   it('rejects access tokens on refresh route', async () => {
      const accessToken = await jwtService.signAsync(
         { sub: 'user-1' },
         {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
         },
      )

      const response = await app.inject({
         method: 'POST',
         url: '/auth/refresh',
         headers: {
            cookie: `refreshToken=${accessToken}`,
         },
      })

      expect(response.statusCode).toBe(401)
   })

   it('clears refresh cookie on logout', async () => {
      const response = await app.inject({
         method: 'POST',
         url: '/auth/logout',
      })

      expect(response.statusCode).toBe(200)
      expect(response.cookies).toEqual(
         expect.arrayContaining([
            expect.objectContaining({
               name: 'refreshToken',
               value: '',
            }),
         ]),
      )
   })

   it('stores argon2id password hashes', () => {
      expect(passwordHash.startsWith('$argon2id$')).toBe(true)
   })
})
