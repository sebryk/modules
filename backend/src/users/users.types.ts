import type { BaseUser } from '../common/types/user';

export type User =
   | BaseUser
   | {
        roleAssignments: UserRoleAssignment[];
     };

export type Role = {
   id: string;
   name: string;
   description: string | null;
   isSystem: boolean;
};

export type UserRoleAssignment = {
   role: Role;
   grantedBy: string | null;
   createdAt: Date;
};
