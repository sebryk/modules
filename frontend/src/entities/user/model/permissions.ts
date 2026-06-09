import type { Me } from './types'

const USER_READ_PERMISSION = 'user:read'

const hasPermission = (
   user: Pick<Me, 'permissions'> | null | undefined,
   permission: string,
): boolean => Boolean(user?.permissions.includes(permission))

export { hasPermission, USER_READ_PERMISSION }
