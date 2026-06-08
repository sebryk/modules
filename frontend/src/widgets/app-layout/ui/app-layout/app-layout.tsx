import { AppShell, NavLink, ScrollArea, Stack, ThemeIcon } from '@mantine/core'
import { ChevronRightIcon } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { appRoutes } from '@/shared/config/navigation'

import { UserMenu } from '../user-menu/user-menu'

const RootLayout = () => {
   const location = useLocation()
   const navigate = useNavigate()

   return (
      <AppShell
         padding="xs"
         navbar={{
            width: 300,
            breakpoint: 'sm',
         }}
      >
         <AppShell.Navbar pt="xs" pb="sm" px="xs">
            <AppShell.Section grow={true} component={ScrollArea}>
               <Stack gap="xs">
                  {appRoutes.map((route) => {
                     const Icon = route.icon
                     const isActive = route.end
                        ? location.pathname === route.to
                        : location.pathname.startsWith(route.to)

                     return (
                        <NavLink
                           bdrs={10}
                           key={route.to}
                           variant="light"
                           active={isActive}
                           label={route.title}
                           rightSection={<ChevronRightIcon size={16} strokeWidth={1.5} />}
                           onClick={() => {
                              navigate(route.to)
                           }}
                           leftSection={
                              <ThemeIcon
                                 size={30}
                                 radius="md"
                                 variant={isActive ? 'filled' : 'light'}
                              >
                                 <Icon size={18} strokeWidth={1.8} />
                              </ThemeIcon>
                           }
                        />
                     )
                  })}
               </Stack>
            </AppShell.Section>

            <AppShell.Section>
               <UserMenu />
            </AppShell.Section>
         </AppShell.Navbar>

         <AppShell.Main>
            <Outlet />
         </AppShell.Main>
      </AppShell>
   )
}

export { RootLayout }
