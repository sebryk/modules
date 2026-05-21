import { PermissionsService } from './permissions.service'

describe('PermissionsService', () => {
   it('deduplicates permissions across roles', async () => {
      const prismaService = {
         permission: {
            findMany: jest.fn().mockResolvedValue([
               {
                  resource: 'application',
                  action: 'create',
               },
               {
                  resource: 'application',
                  action: 'read',
               },
               {
                  resource: 'application',
                  action: 'create',
               },
            ]),
         },
      }

      const permissionsService = new PermissionsService(prismaService as never)

      await expect(permissionsService.getUserPermissions('user-1')).resolves.toEqual(
         new Set(['application:create', 'application:read']),
      )
   })
})
