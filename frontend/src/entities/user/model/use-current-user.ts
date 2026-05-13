import { useQuery } from "@tanstack/react-query"

import { useSessionStore } from "@/entities/session"
import { userQueryKeys } from "@/shared/api/query-keys"

import { getMeRequest } from "../api/get-me"

const useCurrentUser = () => {
   const sessionStatus = useSessionStore((state) => state.status)

   return useQuery({
      queryKey: userQueryKeys.me(),
      queryFn: getMeRequest,
      enabled: sessionStatus === "authenticated",
      staleTime: 5 * 60 * 1000,
      retry: false,
   })
}

export { useCurrentUser }
