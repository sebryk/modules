import { useState } from 'react'

import {
   Avatar,
   Box,
   Group,
   Menu,
   Text,
   UnstyledButton,
} from '@mantine/core'
import {
   ChevronDownIcon,
   LogOutIcon,
   SettingsIcon,
} from 'lucide-react'

import { logoutSession } from '@/entities/session'
import { useCurrentUser } from '@/entities/user'

import classes from './styles.module.css'

const UserMenu = () => {
   const { data: currentUser } = useCurrentUser()
   const [isLoggingOut, setIsLoggingOut] = useState(false)
   const [isOpened, setIsOpened] = useState(false)

   const userName =
      currentUser?.firstName && currentUser?.lastName
         ? `${currentUser.firstName} ${currentUser.lastName}`
         : 'Пользователь'

   const handleLogout = async () => {
      setIsLoggingOut(true)

      try {
         await logoutSession()
      } finally {
         setIsLoggingOut(false)
      }
   }

   return (
      <Menu
         shadow="md"
         offset={10}
         width="target"
         position="top"
         opened={isOpened}
         withinPortal={false}
         onChange={setIsOpened}
      >
         <Menu.Target>
            <UnstyledButton
               className={`${classes['user-menu__trigger']} ${
                  isOpened ? classes['user-menu__trigger-opened'] : ''
               }`}
            >
               <Group gap="sm">
                  <Avatar radius="xl" alt={userName} />
                  <Box style={{ flex: 1 }}>
                     <Text fw={500} size="sm">
                        {userName}
                     </Text>

                     <Text size="xs" c="dimmed">
                        {currentUser?.email ?? 'Нет данных профиля'}
                     </Text>
                  </Box>
                  <ChevronDownIcon
                     size={16}
                     strokeWidth={1.5}
                     style={{
                        transform: isOpened ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 150ms ease',
                     }}
                  />
               </Group>
            </UnstyledButton>
         </Menu.Target>

         <Menu.Dropdown>
            <Menu.Item disabled={true} leftSection={<SettingsIcon size={16} />}>
               Настройки
            </Menu.Item>
            <Menu.Item
               color="red"
               disabled={isLoggingOut}
               leftSection={<LogOutIcon size={16} />}
               onClick={() => {
                  void handleLogout()
               }}
            >
               Выйти
            </Menu.Item>
         </Menu.Dropdown>
      </Menu>
   )
}

export { UserMenu }
