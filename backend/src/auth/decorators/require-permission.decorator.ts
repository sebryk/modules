import { SetMetadata } from '@nestjs/common';

import { PERMISSION_KEY } from '../auth.constants';

export const RequirePermission = (permission: string): MethodDecorator =>
   SetMetadata(PERMISSION_KEY, permission);
