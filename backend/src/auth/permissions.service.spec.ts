import { PermissionsService } from './permissions.service';

describe('PermissionsService', () => {
   it('deduplicates permissions across roles', async () => {
      const prismaService = {
         roleAssignment: {
            findMany: jest.fn().mockResolvedValue([
               {
                  role: {
                     rolePermissions: [
                        {
                           permission: {
                              resource: 'application',
                              action: 'create',
                           },
                        },
                        {
                           permission: {
                              resource: 'application',
                              action: 'read',
                           },
                        },
                     ],
                  },
               },
               {
                  role: {
                     rolePermissions: [
                        {
                           permission: {
                              resource: 'application',
                              action: 'create',
                           },
                        },
                     ],
                  },
               },
            ]),
         },
      };

      const permissionsService = new PermissionsService(prismaService as never);

      await expect(
         permissionsService.getUserPermissions('user-1'),
      ).resolves.toEqual(
         new Set(['application:create', 'application:read']),
      );
   });
});
