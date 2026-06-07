import type { ComponentType } from 'react'
import { FolderIcon, HouseIcon, type LucideProps, UsersIcon } from 'lucide-react'

import { ROUTES } from '@/shared/config/routes'

type AppRouteItem = {
   title: string
   to: string
   icon: ComponentType<LucideProps>
   end?: boolean
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
      title: 'Команда',
      to: ROUTES.team,
      icon: UsersIcon,
   },
]

const routeTitles: Record<string, string> = {
   '/': 'Dashboard',
   '/applications': 'Заявки',
   '/team': 'Команда',
}

export { appRoutes, routeTitles }
export type { AppRouteItem }
