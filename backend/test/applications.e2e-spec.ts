import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ApplicationStatus } from '@prisma/client';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const APPLICATION_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const MISSING_APPLICATION_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

const buildPrismaMock = () => ({
   application: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
   },
   roleAssignment: {
      findMany: jest.fn(),
   },
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

const buildApplication = (
   overrides: Partial<{
      id: string;
      title: string;
      description: string;
      status: ApplicationStatus;
      createdBy: string;
      createdAt: Date;
      updatedAt: Date;
   }> = {},
) => ({
   id: APPLICATION_ID,
   title: 'Broken printer',
   description: 'The printer on floor 2 is offline',
   status: ApplicationStatus.NEW,
   createdBy: USER_ID,
   createdAt: new Date('2024-01-01T00:00:00.000Z'),
   updatedAt: new Date('2024-01-01T00:00:00.000Z'),
   ...overrides,
});

describe('Applications management', () => {
   let app: NestFastifyApplication;
   let prismaMock: ReturnType<typeof buildPrismaMock>;
   let jwtService: JwtService;

   beforeAll(() => {
      process.env.JWT_ACCESS_SECRET = 'test-access-secret';
      process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
      process.env.JWT_ACCESS_TTL = '15m';
      process.env.JWT_REFRESH_TTL = '7d';
   });

   beforeEach(async () => {
      prismaMock = buildPrismaMock();

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
         { sub: USER_ID },
         {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
         },
      );

   it('creates an application with NEW status', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:create']),
      );
      prismaMock.application.create.mockImplementation(
         ({
            data,
         }: {
            data: {
               title: string;
               description: string;
               status: ApplicationStatus;
               createdBy: string;
            };
         }) => buildApplication(data),
      );

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'POST',
         url: '/applications',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            title: 'Broken printer',
            description: 'The printer on floor 2 is offline',
         },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual({
         id: APPLICATION_ID,
         title: 'Broken printer',
         description: 'The printer on floor 2 is offline',
         status: 'NEW',
         createdBy: USER_ID,
         createdAt: '2024-01-01T00:00:00.000Z',
         updatedAt: '2024-01-01T00:00:00.000Z',
      });
      expect(prismaMock.application.create).toHaveBeenCalledWith({
         data: {
            title: 'Broken printer',
            description: 'The printer on floor 2 is offline',
            status: 'NEW',
            createdBy: USER_ID,
         },
      });
   });

   it('ignores client-provided status on create', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:create']),
      );
      prismaMock.application.create.mockImplementation(
         ({
            data,
         }: {
            data: {
               title: string;
               description: string;
               status: ApplicationStatus;
               createdBy: string;
            };
         }) => buildApplication(data),
      );

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'POST',
         url: '/applications',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            title: 'Broken printer',
            description: 'The printer on floor 2 is offline',
            status: 'DONE',
         },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
         status: 'NEW',
      });
      expect(prismaMock.application.create).toHaveBeenCalledWith({
         data: {
            title: 'Broken printer',
            description: 'The printer on floor 2 is offline',
            status: 'NEW',
            createdBy: USER_ID,
         },
      });
   });

   it('returns 403 when application:create permission is missing', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:read']),
      );

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'POST',
         url: '/applications',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            title: 'Broken printer',
            description: 'The printer on floor 2 is offline',
         },
      });

      expect(response.statusCode).toBe(403);
   });

   it('returns applications list for a user with application:read', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:read']),
      );
      prismaMock.application.findMany.mockResolvedValue([buildApplication()]);

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'GET',
         url: '/applications',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
         data: [
            {
               id: APPLICATION_ID,
               title: 'Broken printer',
               description: 'The printer on floor 2 is offline',
               status: 'NEW',
               createdBy: USER_ID,
               createdAt: '2024-01-01T00:00:00.000Z',
               updatedAt: '2024-01-01T00:00:00.000Z',
            },
         ],
      });
   });

   it('returns 403 for list without application:read', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:create']),
      );

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'GET',
         url: '/applications',
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
      });

      expect(response.statusCode).toBe(403);
   });

   it('returns an application by id', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:read']),
      );
      prismaMock.application.findUnique.mockResolvedValue(buildApplication());

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'GET',
         url: `/applications/${APPLICATION_ID}`,
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
         id: APPLICATION_ID,
         title: 'Broken printer',
         description: 'The printer on floor 2 is offline',
         status: 'NEW',
         createdBy: USER_ID,
         createdAt: '2024-01-01T00:00:00.000Z',
         updatedAt: '2024-01-01T00:00:00.000Z',
      });
   });

   it('returns 404 for missing application on get', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:read']),
      );
      prismaMock.application.findUnique.mockResolvedValue(null);

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'GET',
         url: `/applications/${MISSING_APPLICATION_ID}`,
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({
         message: 'Application not found',
         error: 'Not Found',
         statusCode: 404,
      });
   });

   it('updates title and description with application:update', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:update']),
      );
      prismaMock.application.findUnique.mockResolvedValue({ id: APPLICATION_ID });
      prismaMock.application.update.mockResolvedValue(
         buildApplication({
            title: 'Updated title',
            description: 'Updated description',
            updatedAt: new Date('2024-01-02T00:00:00.000Z'),
         }),
      );

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'PATCH',
         url: `/applications/${APPLICATION_ID}`,
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            title: 'Updated title',
            description: 'Updated description',
         },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
         id: APPLICATION_ID,
         title: 'Updated title',
         description: 'Updated description',
         status: 'NEW',
         createdBy: USER_ID,
         createdAt: '2024-01-01T00:00:00.000Z',
         updatedAt: '2024-01-02T00:00:00.000Z',
      });
      expect(prismaMock.application.update).toHaveBeenCalledWith({
         where: { id: APPLICATION_ID },
         data: {
            title: 'Updated title',
            description: 'Updated description',
         },
      });
   });

   it('returns 403 for update without application:update', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:read']),
      );

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'PATCH',
         url: `/applications/${APPLICATION_ID}`,
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            title: 'Updated title',
         },
      });

      expect(response.statusCode).toBe(403);
   });

   it('returns 404 for missing application on update', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:update']),
      );
      prismaMock.application.findUnique.mockResolvedValue(null);

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'PATCH',
         url: `/applications/${MISSING_APPLICATION_ID}`,
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            title: 'Updated title',
         },
      });

      expect(response.statusCode).toBe(404);
   });

   it('updates status separately with application:update_status', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:update_status']),
      );
      prismaMock.application.findUnique.mockResolvedValue({ id: APPLICATION_ID });
      prismaMock.application.update.mockResolvedValue(
         buildApplication({
            status: ApplicationStatus.DONE,
            updatedAt: new Date('2024-01-03T00:00:00.000Z'),
         }),
      );

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'PATCH',
         url: `/applications/${APPLICATION_ID}/status`,
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            status: 'DONE',
         },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
         id: APPLICATION_ID,
         title: 'Broken printer',
         description: 'The printer on floor 2 is offline',
         status: 'DONE',
         createdBy: USER_ID,
         createdAt: '2024-01-01T00:00:00.000Z',
         updatedAt: '2024-01-03T00:00:00.000Z',
      });
      expect(prismaMock.application.update).toHaveBeenCalledWith({
         where: { id: APPLICATION_ID },
         data: { status: 'DONE' },
      });
   });

   it('returns 403 for status update without application:update_status', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:update']),
      );

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'PATCH',
         url: `/applications/${APPLICATION_ID}/status`,
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            status: 'DONE',
         },
      });

      expect(response.statusCode).toBe(403);
   });

   it('returns 404 for missing application on status update', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:update_status']),
      );
      prismaMock.application.findUnique.mockResolvedValue(null);

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'PATCH',
         url: `/applications/${MISSING_APPLICATION_ID}/status`,
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
         payload: {
            status: 'DONE',
         },
      });

      expect(response.statusCode).toBe(404);
   });

   it('deletes an application with application:delete', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:delete']),
      );
      prismaMock.application.findUnique.mockResolvedValue({ id: APPLICATION_ID });
      prismaMock.application.delete.mockResolvedValue(buildApplication());

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'DELETE',
         url: `/applications/${APPLICATION_ID}`,
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
      });

      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('');
      expect(prismaMock.application.delete).toHaveBeenCalledWith({
         where: { id: APPLICATION_ID },
      });
   });

   it('returns 403 for delete without application:delete', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:read']),
      );

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'DELETE',
         url: `/applications/${APPLICATION_ID}`,
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
      });

      expect(response.statusCode).toBe(403);
   });

   it('returns 404 for missing application on delete', async () => {
      prismaMock.roleAssignment.findMany.mockResolvedValue(
         buildRoleAssignments(['application:delete']),
      );
      prismaMock.application.findUnique.mockResolvedValue(null);

      const accessToken = await createAccessToken();
      const response = await app.inject({
         method: 'DELETE',
         url: `/applications/${MISSING_APPLICATION_ID}`,
         headers: {
            authorization: `Bearer ${accessToken}`,
         },
      });

      expect(response.statusCode).toBe(404);
   });
});
