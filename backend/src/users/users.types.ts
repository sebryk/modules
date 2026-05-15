import type { BaseUser } from '../common/types/user';
import type { Role } from '../rbac/rbac.types';

export type User =
   | BaseUser
   | {
        roleAssignments: UserRoleAssignment[];
     };

export type UserRoleAssignment = {
   role: Role;
   grantedBy: string | null;
   createdAt: Date;
};
