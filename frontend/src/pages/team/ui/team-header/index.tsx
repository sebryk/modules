import { Button, Group, Title } from '@mantine/core'
import { UserPlusIcon } from 'lucide-react'

import { TEAM_HEADER_CONTENT } from '@/shared/data/team-page'

const TeamHeader = () => {
   const { title, addEmployee } = TEAM_HEADER_CONTENT

   return (
      <Group gap="sm" wrap="wrap" align="center" justify="space-between">
         <Title order={2}>{title}</Title>
         <Button disabled={true} leftSection={<UserPlusIcon size={16} />}>
            {addEmployee}
         </Button>
      </Group>
   )
}

export { TeamHeader }
