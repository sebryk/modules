import type { UsersList, UsersListParams } from '../model/types'

import { apiClient } from '@/shared/api/http'

const getUsersRequest = async (
   params: UsersListParams,
   signal: AbortSignal,
): Promise<UsersList> => {
   const response = await apiClient.get<UsersList>('/users', { params, signal })

   return response.data
}

export { getUsersRequest }
