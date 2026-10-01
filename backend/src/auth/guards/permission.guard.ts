import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import type { AuthenticatedRequest } from '../../common/types/api'
import { PermissionsService } from '../../rbac/permissions.service'
import { PERMISSION_KEY } from '../auth.constants'

@Injectable()
export class PermissionGuard implements CanActivate {
   public constructor(
      private readonly reflector: Reflector,
      private readonly permissionsService: PermissionsService,
   ) {}

   public async canActivate(context: ExecutionContext): Promise<boolean> {
      const permission = this.reflector.getAllAndOverride<string | undefined>(PERMISSION_KEY, [
         context.getHandler(),
         context.getClass(),
      ])

      if (!permission) {
         return true
      }

      const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
      const userId = request.user?.id

      if (!userId) {
         throw new ForbiddenException('Permission denied')
      }

      const userPermissions = await this.permissionsService.getUserPermissions(userId)

      if (!userPermissions.has(permission)) {
         throw new ForbiddenException('Permission denied')
      }

      return true
   }
}
