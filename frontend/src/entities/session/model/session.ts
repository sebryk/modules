import { create } from 'zustand'

import { logoutRequest } from '@/shared/api/auth'
import { queryClient } from '@/shared/api/query-client'
import { authQueryKeys, userQueryKeys } from '@/shared/api/query-keys'

type SessionStatus = 'unknown' | 'authenticated' | 'anonymous'

type SessionState = {
   accessToken: string | null
   status: SessionStatus
   setAccessToken: (accessToken: string) => void
   clearSession: () => void
}

const useSessionStore = create<SessionState>((set) => ({
   accessToken: null,
   status: 'unknown',
   setAccessToken: (accessToken) => {
      set({
         accessToken,
         status: 'authenticated',
      })
   },
   clearSession: () => {
      set({
         accessToken: null,
         status: 'anonymous',
      })
   },
}))

const setAccessToken = (accessToken: string) =>
   useSessionStore.getState().setAccessToken(accessToken)

const clearSession = () => useSessionStore.getState().clearSession()

const getAccessToken = () => useSessionStore.getState().accessToken

const getSessionStatus = () => useSessionStore.getState().status

const isAuthenticated = () => getSessionStatus() === 'authenticated'

const logoutSession = async (): Promise<void> => {
   try {
      await logoutRequest()
   } finally {
      clearSession()
      queryClient.removeQueries({ queryKey: authQueryKeys.bootstrap() })
      queryClient.removeQueries({ queryKey: userQueryKeys.me() })
   }
}

export {
   clearSession,
   getAccessToken,
   getSessionStatus,
   isAuthenticated,
   logoutSession,
   setAccessToken,
   useSessionStore,
}
export type { SessionStatus }
