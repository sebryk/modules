import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router"

import { useSessionStore } from "@/entities/session"
import { ROUTES } from "@/shared/config/routes"

type RedirectState = {
   from?: {
      pathname?: string
   }
}

const PublicRoute = ({ children }: { children: ReactNode }) => {
   const location = useLocation()
   const state = location.state as RedirectState | null
   const sessionStatus = useSessionStore((state) => state.status)

   if (sessionStatus === "unknown") {
      return null
   }

   if (sessionStatus === "authenticated") {
      return <Navigate to={state?.from?.pathname ?? ROUTES.dashboard} replace />
   }

   return <>{children}</>
}

export { PublicRoute }
