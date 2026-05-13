import { useCurrentUser } from "@/entities/user"
import * as React from "react"
import { Apple } from "lucide-react"
import { Link } from "react-router"

import { useSessionStore } from "@/entities/session"
import { appRoutes } from "@/shared/config/navigation"
import { NavMain } from "@/shared/ui/nav-main"
import { NavUser } from "@/shared/ui/nav-user"
import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from "@/shared/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   const sessionStatus = useSessionStore((state) => state.status)
   const { data } = useCurrentUser()
   const currentUser = data?.user

   return (
      <Sidebar collapsible="icon" {...props}>
         <SidebarHeader>
            <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton
                     asChild
                     className="data-[slot=sidebar-menu-button]:p-1.5!"
                  >
                     <Link to="/">
                        <Apple className="size-5!" />
                        <span className="text-base font-semibold">
                           Компания
                        </span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
         </SidebarHeader>
         <SidebarContent>
            <NavMain items={appRoutes} />
         </SidebarContent>
         <SidebarFooter>
            {sessionStatus === "authenticated" && currentUser && (
               <NavUser
                  firstName={currentUser.firstName || ""}
                  lastName={currentUser.lastName || ""}
                  email={currentUser?.email || ""}
               />
            )}
         </SidebarFooter>
      </Sidebar>
   )
}
