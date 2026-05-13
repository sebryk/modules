import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router"

import { useSessionStore } from "@/entities/session"
import { ROUTES } from "@/shared/config/routes"

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
   const location = useLocation()
   const sessionStatus = useSessionStore((state) => state.status)

   if (sessionStatus === "unknown") {
      return null
   }

   if (sessionStatus !== "authenticated") {
      return (
         <Navigate
            to={ROUTES.login}
            replace
            state={{ from: { pathname: location.pathname } }}
         />
      )
   }

   return <>{children}</>
}

export { ProtectedRoute }
