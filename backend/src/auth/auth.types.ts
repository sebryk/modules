import type { BaseUser } from '../common/types/user';

export type AuthTokens = {
   accessToken: string;
   refreshToken: string;
};

export type MeResponse = {
   user: BaseUser;
   permissions: string[];
};
