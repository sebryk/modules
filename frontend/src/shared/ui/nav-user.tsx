import { logoutSession } from '@/entities/session'
import { ROUTES } from '@/shared/config/routes'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/shared/ui/sidebar'
import { EllipsisVerticalIcon, LogOutIcon } from 'lucide-react'
import { useNavigate } from 'react-router'

type NavUserProps = {
   firstName: string
   lastName: string
   email: string
   avatar?: string
}

function UserInfo({ firstName, lastName, email }: NavUserProps) {
   return (
      <>
         <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="rounded-lg">
               {firstName.slice(0, 1).toUpperCase()}
               {lastName.slice(0, 1).toUpperCase()}
            </AvatarFallback>
         </Avatar>
         <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
               {firstName} {lastName}
            </span>
            <span className="truncate text-xs text-muted-foreground">{email}</span>
         </div>
      </>
   )
}

export function NavUser({ firstName, lastName, email, avatar }: NavUserProps) {
   const { isMobile } = useSidebar()
   const navigate = useNavigate()

   const handleLogout = async () => {
      await logoutSession()
      navigate(ROUTES.login, { replace: true })
   }

   return (
      <SidebarMenu>
         <SidebarMenuItem>
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                     size="lg"
                     className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                     <Avatar className="h-8 w-8 rounded-lg grayscale">
                        {avatar && <AvatarImage src={avatar} alt={firstName} />}
                        <AvatarFallback className="rounded-lg">
                           {firstName.slice(0, 1).toUpperCase()}
                           {lastName.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                     </Avatar>
                     <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                           {firstName} {lastName}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">{email}</span>
                     </div>
                     <EllipsisVerticalIcon className="ml-auto size-4" />
                  </SidebarMenuButton>
               </DropdownMenuTrigger>
               <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={isMobile ? 'bottom' : 'right'}
                  align="end"
                  sideOffset={4}
               >
                  <DropdownMenuLabel className="p-0 font-normal">
                     <div className="flex items-center gap-2 px-1 py-1">
                        <UserInfo firstName={firstName} lastName={lastName} email={email} />
                     </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleLogout}>
                     <LogOutIcon />
                     Выйти
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </SidebarMenuItem>
      </SidebarMenu>
   )
}
