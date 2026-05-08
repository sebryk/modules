import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router"

import { isAuthenticated } from "@/entities/session"
import { ROUTES } from "@/shared/config/routes"

type RedirectState = {
   from?: {
      pathname?: string
   }
}

type PublicOnlyRouteProps = {
   children: ReactNode
}

const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
   const location = useLocation()
   const state = location.state as RedirectState | null

   if (isAuthenticated()) {
      return <Navigate to={state?.from?.pathname ?? ROUTES.dashboard} replace />
   }

   return <>{children}</>
}

export { PublicOnlyRoute }
