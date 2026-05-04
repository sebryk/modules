import type { BaseUser } from '../common/types/user';

export type CreateUserResponse = {
   user: BaseUser;
   roles: UserRole[];
};

export type UserRole = {
   id: string;
   name: string;
};

export type Roles = {
   id: string;
   name: string;
   description: string | null;
   isSystem: boolean;
};

export type RolesListResponse = {
   items: Roles[];
};
