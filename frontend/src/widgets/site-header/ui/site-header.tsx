import { useLocation } from 'react-router'

import { routeTitles } from '@/shared/config/navigation'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/shared/ui/breadcrumb'
import { Separator } from '@/shared/ui/separator'
import { SidebarTrigger } from '@/shared/ui/sidebar'

export function SiteHeader() {
   const location = useLocation()
   const title = routeTitles[location.pathname] ?? 'Home'

   return (
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
         <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
               <BreadcrumbList>
                  <BreadcrumbItem>
                     <BreadcrumbPage>{title}</BreadcrumbPage>
                  </BreadcrumbItem>
               </BreadcrumbList>
            </Breadcrumb>
         </div>
      </header>
   )
}
