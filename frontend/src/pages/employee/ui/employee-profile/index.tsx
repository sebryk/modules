import type { EmployeeRecord } from '@/shared/mocks/employees'

import { Divider, Group, Paper, Stack, Text } from '@mantine/core'
import { MailIcon } from 'lucide-react'

import { EMPLOYEE_PAGE_CONTENT } from '@/shared/data/employee-page'

import classes from '../styles.module.css'

type EmployeeProfileProps = {
   employee?: EmployeeRecord
   isCreateMode: boolean
}

const formatCreatedAt = (value: string) =>
   new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
   }).format(new Date(value))

const EmployeeProfile = ({ employee, isCreateMode }: EmployeeProfileProps) => {
   const { title, createDescription, employeeDescription, emailLabel, emailAfterSave, employeeSince } =
      EMPLOYEE_PAGE_CONTENT.profile

   return (
      <Paper p="lg" radius="lg" shadow="sm" withBorder={true}>
         <Stack gap="md">
            <div>
               <Text fw={600}>{title}</Text>
               <Text size="sm" c="dimmed">
                  {isCreateMode ? createDescription : employeeDescription}
               </Text>
            </div>
            <Divider />
            <Group gap="sm" wrap="nowrap">
               <MailIcon size={18} className={classes['employee-page__muted-icon']} />
               <div>
                  <Text size="xs" c="dimmed">
                     {emailLabel}
                  </Text>
                  <Text size="sm">{employee?.email || emailAfterSave}</Text>
               </div>
            </Group>
            {employee && (
               <div>
                  <Text size="xs" c="dimmed">
                     {employeeSince}
                  </Text>
                  <Text size="sm">{formatCreatedAt(employee.createdAt)}</Text>
               </div>
            )}
         </Stack>
      </Paper>
   )
}

export { EmployeeProfile }
