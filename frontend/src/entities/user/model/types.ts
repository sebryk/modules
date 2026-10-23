type UserStatus = 'active' | 'invited' | 'vacation'

type User = {
   id: string
   email: string
   firstName: string
   lastName: string
   position: string
   status: UserStatus
   avatarUrl: string | null
   createdAt: string
}

type UsersListParams = {
   search?: string
   position?: string
   status?: UserStatus
   sortBy: 'name' | 'position' | 'email' | 'status' | 'createdAt'
   sortOrder: 'asc' | 'desc'
   page: number
   pageSize: number
}

type UsersList = {
   data: User[]
   meta: {
      page: number
      pageSize: number
      total: number
      totalPages: number
   }
}

type Me = User & {
   permissions: string[]
}

export type { Me, User, UsersList, UserStatus, UsersListParams }
