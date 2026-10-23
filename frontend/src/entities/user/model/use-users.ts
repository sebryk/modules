import type { UsersListParams } from './types'

import { useQuery } from '@tanstack/react-query'

import { userQueryKeys } from '@/shared/api/query-keys'

import { getUsersRequest } from '../api/get-users'

const useUsers = (params: UsersListParams) =>
   useQuery({
      queryKey: userQueryKeys.list(params),
      queryFn: ({ signal }) => getUsersRequest(params, signal),
      retry: false,
   })

export { useUsers }
