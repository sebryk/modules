import type { RedirectState } from '@/shared/types/router'

import type { ReactNode } from 'react'

import { Navigate, useLocation } from 'react-router'

import { useSessionStore } from '@/entities/session'
import { ROUTES } from '@/shared/config/routes'

const PublicRoute = ({ children }: { children: ReactNode }) => {
   const location = useLocation()
   const state = location.state as RedirectState | null
   const sessionStatus = useSessionStore((state) => state.status)

   if (sessionStatus === 'unknown') {
      return null
   }

   if (sessionStatus === 'authenticated') {
      return <Navigate replace={true} to={state?.from?.pathname ?? ROUTES.dashboard} />
   }

   return <>{children}</>
}

export { PublicRoute }
