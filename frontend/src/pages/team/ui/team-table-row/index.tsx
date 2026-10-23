import type { User } from '@/entities/user'

import { ActionIcon, Avatar, Badge, Group, Menu, Stack, Table, Text } from '@mantine/core'
import { EllipsisIcon, PencilIcon, Trash2Icon } from 'lucide-react'

import {
   EMPLOYEE_STATUS_COLORS,
   EMPLOYEE_STATUS_LABELS,
   POSITION_COLORS,
   TEAM_ROW_CONTENT,
} from '@/shared/data/team-page'

type TeamTableRowProps = {
   employee: User
}

const formatCreatedAt = (value: string) =>
   new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
   }).format(new Date(value))

const TeamTableRow = ({ employee }: TeamTableRowProps) => {
   const fullName = `${employee.firstName} ${employee.lastName}`
   const { statusIndicator, edit, delete: deleteLabel, employeeId, actionsLabel } = TEAM_ROW_CONTENT

   return (
      <Table.Tr>
         <Table.Td>
            <Group gap="sm" wrap="nowrap">
               <Avatar radius="xl" color="blue" alt={fullName} src={employee.avatarUrl}>
                  {employee.firstName[0]}
                  {employee.lastName[0]}
               </Avatar>
               <Stack gap={2} miw={0}>
                  <Text fw={500} size="sm" truncate={true}>
                     {fullName}
                  </Text>
                  <Text size="xs" c="dimmed">
                     {employeeId(employee.id)}
                  </Text>
               </Stack>
            </Group>
         </Table.Td>
         <Table.Td>
            <Badge
               radius="sm"
               fw="initial"
               variant="light"
               color={
                  Object.hasOwn(POSITION_COLORS, employee.position)
                     ? POSITION_COLORS[employee.position]
                     : 'gray'
               }
            >
               {employee.position}
            </Badge>
         </Table.Td>
         <Table.Td>
            <Text size="sm" truncate={true}>
               {employee.email}
            </Text>
         </Table.Td>
         <Table.Td>
            <Group gap="xs" wrap="nowrap">
               <Text lh={1} size="lg" c={EMPLOYEE_STATUS_COLORS[employee.status]}>
                  {statusIndicator}
               </Text>
               <Text size="sm">{EMPLOYEE_STATUS_LABELS[employee.status]}</Text>
            </Group>
         </Table.Td>
         <Table.Td>
            <Text size="sm">{formatCreatedAt(employee.createdAt)}</Text>
         </Table.Td>
         <Table.Td>
            <Group justify="flex-end">
               <Menu width={180} shadow="md" position="bottom-end">
                  <Menu.Target>
                     <ActionIcon color="gray" variant="subtle" aria-label={actionsLabel(fullName)}>
                        <EllipsisIcon size={18} />
                     </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                     <Menu.Item disabled={true} leftSection={<PencilIcon size={16} />}>
                        {edit}
                     </Menu.Item>
                     <Menu.Item color="red" disabled={true} leftSection={<Trash2Icon size={16} />}>
                        {deleteLabel}
                     </Menu.Item>
                  </Menu.Dropdown>
               </Menu>
            </Group>
         </Table.Td>
      </Table.Tr>
   )
}

export { TeamTableRow }
