import type { ComponentType } from 'react'

import {
   AppShell,
   Avatar,
   Box,
   Group,
   NavLink,
   ScrollArea,
   Stack,
   Text,
   ThemeIcon,
   UnstyledButton,
} from '@mantine/core'
import { ChevronRightIcon, type LucideProps } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { useCurrentUser } from '@/entities/user'
import { appRoutes } from '@/shared/config/navigation'

import classes from './styles.module.css'

type IconComponent = ComponentType<LucideProps>

const iconProps = {
   size: 18,
   strokeWidth: 1.8,
}

const RootLayout = () => {
   const location = useLocation()
   const navigate = useNavigate()
   const { data: currentUser } = useCurrentUser()
   // const { theme, setTheme } = useTheme()

   const userName =
      currentUser?.firstName && currentUser?.lastName
         ? `${currentUser.firstName} ${currentUser.lastName}`
         : 'Пользователь'

   return (
      <AppShell
         padding="xs"
         navbar={{
            width: 300,
            breakpoint: 'sm',
         }}
      >
         {/* <AppShell.Header>
            <Group px="md" h="100%" justify="space-between">
               <Group gap="sm">
                  <Burger size="sm" hiddenFrom="sm" opened={opened} onClick={toggle} />
                  <div>
                     <Text fw={700}>Company Modules</Text>
                     <Text size="xs" c="dimmed">
                        {activeTitle}
                     </Text>
                  </div>
               </Group>

               <Group gap="xs">
                  <ActionIcon
                     size="lg"
                     variant="subtle"
                     onClick={toggleTheme}
                     aria-label="Toggle theme"
                  >
                     {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                  </ActionIcon>
                  <Button
                     variant="light"
                     onClick={() => void handleLogout()}
                     leftSection={<LogOutIcon size={16} />}
                  >
                     Выйти
                  </Button>
               </Group>
            </Group>
         </AppShell.Header> */}

         <AppShell.Navbar px="xs" py="md">
            <AppShell.Section grow={true} component={ScrollArea}>
               <Stack gap="xs">
                  {appRoutes.map((route) => {
                     const Icon = route.icon as IconComponent
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
                                 <Icon {...iconProps} />
                              </ThemeIcon>
                           }
                        />
                     )
                  })}
               </Stack>
            </AppShell.Section>

            <AppShell.Section>
               <UnstyledButton className={classes.user}>
                  <Group>
                     <Avatar radius="xl" alt="Harriette Spoonlicker" />
                     <Box style={{ flex: 1 }}>
                        <Text fw={500} size="sm">
                           {userName}
                        </Text>

                        <Text size="xs" c="dimmed">
                           {currentUser?.email ?? 'Нет данных профиля'}
                        </Text>
                     </Box>
                     <ChevronRightIcon size={16} strokeWidth={1.5} />
                  </Group>
               </UnstyledButton>
            </AppShell.Section>
         </AppShell.Navbar>

         <AppShell.Main>
            <Outlet />
         </AppShell.Main>
      </AppShell>
   )
}

export { RootLayout }
