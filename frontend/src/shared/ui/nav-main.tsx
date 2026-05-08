import { NavLink } from "react-router"

import type { AppRouteItem } from "@/shared/config/navigation"
import {
   SidebarGroup,
   SidebarGroupContent,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from "@/shared/ui/sidebar"

type NavMainProps = {
   items: AppRouteItem[]
}

export function NavMain({ items }: NavMainProps) {
   return (
      <SidebarGroup>
         <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
               {items.map((item) => {
                  const Icon = item.icon

                  return (
                     <SidebarMenuItem key={item.title}>
                        <NavLink to={item.to} end={item.end}>
                           {({ isActive }) => (
                              <SidebarMenuButton
                                 asChild
                                 isActive={isActive}
                                 tooltip={item.title}
                              >
                                 <span>
                                    <Icon />
                                    <span>{item.title}</span>
                                 </span>
                              </SidebarMenuButton>
                           )}
                        </NavLink>
                     </SidebarMenuItem>
                  )
               })}
            </SidebarMenu>
         </SidebarGroupContent>
      </SidebarGroup>
   )
}
