import type { ReactNode } from 'react'

import { Navigate } from 'react-router'

import { hasPermission, useCurrentUser } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'

type PermissionRouteProps = {
   children: ReactNode
   permission: string
}

const PermissionRoute = ({ children, permission }: PermissionRouteProps) => {
   const currentUserQuery = useCurrentUser()

   if (currentUserQuery.isLoading) {
      return null
   }

   if (!hasPermission(currentUserQuery.data, permission)) {
      return <Navigate replace={true} to={ROUTES.dashboard} />
   }

   return <>{children}</>
}

export { PermissionRoute }
