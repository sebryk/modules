type User = {
   id: string
   email: string
   firstName: string
   lastName: string
   position: string
   createdAt: string
}

type Me = User & {
   permissions: string[]
}

export type { Me, User }
