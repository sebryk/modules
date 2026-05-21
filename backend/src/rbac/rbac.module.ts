import { Module } from '@nestjs/common'

import { PermissionsService } from './permissions.service'
import { RbacController } from './rbac.controller'
import { RbacService } from './rbac.service'

@Module({
   controllers: [RbacController],
   providers: [PermissionsService, RbacService],
   exports: [PermissionsService, RbacService],
})
export class RbacModule {}
