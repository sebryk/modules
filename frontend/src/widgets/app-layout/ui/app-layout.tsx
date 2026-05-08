import type { CSSProperties } from "react"
import { Outlet } from "react-router"

import { AppSidebar } from "@/widgets/app-sidebar"
import { SiteHeader } from "@/widgets/site-header"
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar"

const RootLayout = () => {
   return (
      <SidebarProvider
         style={
            {
               "--sidebar-width": "calc(var(--spacing) * 72)",
               "--header-height": "calc(var(--spacing) * 12)",
            } as CSSProperties
         }
      >
         <AppSidebar variant="inset" />
         <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
               <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
                     <Outlet />
                  </div>
               </div>
            </div>
         </SidebarInset>
      </SidebarProvider>
   )
}

export { RootLayout }
