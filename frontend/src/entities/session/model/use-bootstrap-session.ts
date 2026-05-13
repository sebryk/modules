import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"

import { authQueryKeys } from "@/shared/api/query-keys"
import { refreshAccessTokenRequest } from "@/shared/api/auth"

import { clearSession, setAccessToken } from "./session"

const useBootstrapSession = () => {
   const query = useQuery({
      queryKey: authQueryKeys.bootstrap(),
      queryFn: refreshAccessTokenRequest,
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
   })

   useEffect(() => {
      if (query.data) {
         setAccessToken(query.data)
      } else if (query.isError) {
         clearSession()
      }
   }, [query.data, query.isError])

   return query
}

export { useBootstrapSession }
