import type { UserStatus } from '@prisma/client'

export type BaseUser = {
   id: string
   email: string
   firstName: string
   lastName: string
   position: string
   status: UserStatus
   avatarUrl: string | null
   createdAt: Date
}
