import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router"

import { isAuthenticated } from "@/entities/session"
import { ROUTES } from "@/shared/config/routes"

type ProtectedRouteProps = {
   children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
   const location = useLocation()

   if (!isAuthenticated()) {
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
