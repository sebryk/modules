import type { ComponentType } from 'react'

import { FolderIcon, HouseIcon, type LucideProps, UsersIcon } from 'lucide-react'

import { ROUTES } from '@/shared/config/routes'

type AppRouteItem = {
   title: string
   to: string
   icon: ComponentType<LucideProps>
   end?: boolean
   permission?: string
}

const appRoutes: AppRouteItem[] = [
   {
      title: 'Dashboard',
      to: ROUTES.dashboard,
      icon: HouseIcon,
      end: true,
   },
   {
      title: 'Заявки',
      to: ROUTES.applications,
      icon: FolderIcon,
   },
   {
      title: 'Сотрудники',
      to: ROUTES.team,
      icon: UsersIcon,
      permission: 'user:read',
   },
]

const routeTitles: Record<string, string> = {
   '/': 'Dashboard',
   '/applications': 'Заявки',
   '/team': 'Сотрудники',
}

export { appRoutes, routeTitles }
export type { AppRouteItem }
