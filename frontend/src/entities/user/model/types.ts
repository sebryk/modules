type CurrentUser = {
   id: string
   email: string
   firstName: string
   lastName: string
   position: string
   createdAt: string
}

type MeResponse = {
   user: CurrentUser
   permissions: string[]
}

export type { CurrentUser, MeResponse }
