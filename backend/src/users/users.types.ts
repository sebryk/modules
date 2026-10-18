import type { BaseUser } from '../common/types/user'
import type { Role } from '../rbac/rbac.types'

export type User = BaseUser & {
   roleAssignments?: UserRoleAssignment[]
}

export type UsersList = {
   data: User[]
   meta: {
      page: number
      pageSize: number
      total: number
      totalPages: number
   }
}

export type UserRoleAssignment = {
   role: Role
   grantedBy: string | null
   createdAt: Date
}
