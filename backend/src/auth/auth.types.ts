import type { BaseUser } from '../common/types/user'

export type AuthTokens = {
   accessToken: string
   refreshToken: string
}

export type Me = BaseUser & {
   permissions: string[]
}

export type TokenType = 'ACCESS' | 'REFRESH'

export type JwtPayload = {
   sub: string
}
