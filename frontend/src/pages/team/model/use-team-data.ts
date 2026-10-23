import { useEffect } from 'react'

import { isAxiosError } from 'axios'

import { useUsers, type UsersListParams } from '@/entities/user'
import { TEAM_TABLE_CONTENT } from '@/shared/data/team-page'

const useTeamData = (params: UsersListParams, setPage: (page: number) => void) => {
   const usersQuery = useUsers(params)
   const meta = usersQuery.data?.meta
   const lastPage = Math.max(1, meta?.totalPages ?? 0)
   const pageOutOfRange = Boolean(meta && params.page > lastPage)

   useEffect(() => {
      if (usersQuery.isSuccess && !usersQuery.isFetching && pageOutOfRange) {
         setPage(lastPage)
      }
   }, [usersQuery.isSuccess, usersQuery.isFetching, pageOutOfRange, lastPage, setPage])

   const retry = () => {
      void usersQuery.refetch()
   }

   return {
      totalPages: meta?.totalPages ?? 0,
      employees: usersQuery.data?.data ?? [],
      totalEmployees: meta?.total ?? 0,
      isLoading:
         usersQuery.isPending || usersQuery.isFetching || (usersQuery.isSuccess && pageOutOfRange),
      isError: usersQuery.isError,
      errorMessage:
         isAxiosError(usersQuery.error) && usersQuery.error.response?.status === 403
            ? TEAM_TABLE_CONTENT.forbidden
            : TEAM_TABLE_CONTENT.errorDescription,
      retry,
   }
}

export { useTeamData }
