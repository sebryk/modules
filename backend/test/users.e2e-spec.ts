import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const ADMIN_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const USER_ROLE_ID = '11111111-1111-4111-8111-111111111111';
const SUPPORT_ROLE_ID = '22222222-2222-4222-8222-222222222222';

const buildPrismaMock = () => ({
   user: {
      findUnique: jest.fn(),
      create: jest.fn(),
   },
   role: {
      findMany: jest.fn(),
   },
   roleAssignment: {
      findMany: jest.fn(),
      createMany: jest.fn(),
   },
   $transaction: jest.fn(),
});

const buildRoleAssignments = (permissions: string[]) =>
   permissions.map((permission) => {
      const [resource, action] = permission.split(':');

      return {
         role: {
            rolePermissions: [
               {
                  permission: {
                     resource,
                     action,
                  },
               },
            ],
         },
      };
   });

describe('Users management', () => {
   let app: NestFastifyApplication;
   let prismaMock: ReturnType<typeof buildPrismaMock>;
   let jwtService: JwtService;
   let createdUserData: {
      email: string;
      firstName: string;
      lastName: string;
      position: string;
      passwordHash: string;
   } | null;

   beforeAll(() => {
      process.env.JWT_ACCESS_SECRET = 'test-access-secret';
      process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
      process.env.JWT_ACCESS_TTL = '15m';
      process.env.JWT_REFRESH_TTL = '7d';
   });

   beforeEach(async () => {
      prismaMock = buildPrismaMock();
      createdUserData = null;

      const transactionContext = {
         user: prismaMock.user,
         roleAssignment: prismaMock.roleAssignment,
      };
      prismaMock.$transaction.mockImplementation(
         <TValue>(
            callback: (tx: typeof transactionContext) => Promise<TValue>,
         ) => callback(transactionContext),
      );

      const moduleRef = await Test.createTestingModule({
         imports: [AppModule],
      })
         .overrideProvider(PrismaService)
         .useValue(prismaMock)
         .compile();

      app = moduleRef.createNestApplication<NestFastifyApplication>(
         new FastifyAdapter(),
      );
      app.useGlobalPipes(
         new ValidationPipe({
            whitelist: true,
            transform: true,
         }),
      );
      await app.init();
      await app.getHttpAdapter().getInstance().ready();

      jwtService = app.get(JwtService);
   });

   afterEach(async () => {
      await app.close();
   });

   const createAccessToken = async (): Promise<string> =>
      jwtService.signAsync(
         { sub: ADMIN_ID },
         {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
         },
      );

   it('creates a user with assigned roles', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['user:create']),
      );
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.role.findMany.mockResolvedValue([
         {
            id: USER_ROLE_ID,
            name: 'manager',
         },
      ]);
      prismaMock.user.create.mockImplementation(
         ({
            data,
         }: {
            data: {
               email: string;
               firstName: string;
               lastName: string;
               position: string;
               passwordHash: string;
            };
         }) => {
            createdUserData = data;

            return {
               id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
               email: 'new.user@example.com',
               firstName: 'New',
               lastName: 'User',
               position: 'Manager',
               createdAt: new Date('2024-01-01T00:00:00.000Z'),
            };
         },
      );
      prismaMock.roleAssignment.createMany.mockResolvedValue({
         count: 1,
      });

      const accessToken = await createAccessToken();
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
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toEqual({
         user: {
            id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            email: 'new.user@example.com',
            firstName: 'New',
            lastName: 'User',
            position: 'Manager',
            createdAt: '2024-01-01T00:00:00.000Z',
         },
         roles: [
            {
               id: USER_ROLE_ID,
               name: 'manager',
            },
         ],
      });
      expect(prismaMock.roleAssignment.createMany).toHaveBeenCalledWith({
         data: [
            {
               userId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
               roleId: USER_ROLE_ID,
               grantedBy: ADMIN_ID,
            },
         ],
      });
      expect(createdUserData).toMatchObject({
         email: 'new.user@example.com',
         firstName: 'New',
         lastName: 'User',
         position: 'Manager',
      });
      expect(createdUserData?.passwordHash).toEqual(expect.any(String));
      expect(createdUserData?.passwordHash).not.toBe('ChangeMe123!');
   });

   it('returns 403 when user:create permission is missing', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:read']),
      );

      const accessToken = await createAccessToken();
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
      });

      expect(response.statusCode).toBe(403);
   });

   it('returns 409 for duplicate email', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['user:create']),
      );
      prismaMock.user.findUnique.mockResolvedValue({
         id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      });

      const accessToken = await createAccessToken();
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
      });

      expect(response.statusCode).toBe(409);
      expect(JSON.parse(response.body)).toEqual({
         message: 'User with this email already exists',
         error: 'Conflict',
         statusCode: 409,
      });
   });

   it('returns 400 for empty roleIds', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['user:create']),
      );

      const accessToken = await createAccessToken();
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
      });

      expect(response.statusCode).toBe(400);
   });

   it('returns 400 for unknown role ids', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['user:create']),
      );
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.role.findMany.mockResolvedValue([
         {
            id: USER_ROLE_ID,
            name: 'manager',
         },
      ]);

      const accessToken = await createAccessToken();
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
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({
         message: 'One or more roles do not exist',
         error: 'Bad Request',
         statusCode: 400,
      });
   });

   it('returns roles for a user with role:read permission', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['role:read']),
      );
      prismaMock.role.findMany.mockResolvedValue([
         {
            id: USER_ROLE_ID,
            name: 'manager',
            description: 'Can manage users',
            isSystem: false,
         },
      ]);

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'GET',
         url: '/roles',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
         items: [
            {
               id: USER_ROLE_ID,
               name: 'manager',
               description: 'Can manage users',
               isSystem: false,
            },
         ],
      });
   });

   it('returns 403 when role:read permission is missing', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:read']),
      );

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'GET',
         url: '/roles',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
      });

      expect(response.statusCode).toBe(403);
   });
});
