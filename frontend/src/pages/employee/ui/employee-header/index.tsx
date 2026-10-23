import type { EmployeeRecord } from '@/shared/mocks/employees'

import { Avatar, Badge, Breadcrumbs, Button, Group, Stack, Text, Title } from '@mantine/core'
import { Trash2Icon } from 'lucide-react'
import { Link } from 'react-router'

import { ROUTES } from '@/shared/config/routes'
import {
   EMPLOYEE_PAGE_CONTENT,
   EMPLOYEE_STATUS_COLORS,
   EMPLOYEE_STATUS_LABELS,
} from '@/shared/data/employee-page'

import classes from '../styles.module.css'

type EmployeeHeaderProps = {
   employee?: EmployeeRecord
   isCreateMode: boolean
   onDeleteClick: () => void
}

const EmployeeHeader = ({ employee, isCreateMode, onDeleteClick }: EmployeeHeaderProps) => {
   const { breadcrumbSeparator, teamLink, createBreadcrumb, newEmployeeName, newEmployeeInitials } =
      EMPLOYEE_PAGE_CONTENT
   const fullName = employee
      ? `${employee.firstName} ${employee.lastName}`
      : newEmployeeName
   const initials = employee
      ? `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`
      : newEmployeeInitials

   return (
      <>
         <Breadcrumbs separator={breadcrumbSeparator} className={classes['employee-page__breadcrumbs']}>
            <Button
               px={0}
               component={Link}
               to={ROUTES.team}
               variant="subtle"
               className={classes['employee-page__breadcrumbs-btn']}
            >
               {teamLink}
            </Button>
            <Text size="sm">{isCreateMode ? createBreadcrumb : fullName}</Text>
         </Breadcrumbs>

         <Group gap="md" wrap="wrap" align="flex-start" justify="space-between">
            <Group gap="md" wrap="nowrap">
               <Avatar size={72} radius="xl" color="blue" src={employee?.avatarUrl}>
                  {initials}
               </Avatar>
               <Stack gap={4}>
                  <Title order={2}>{fullName}</Title>
                  {!isCreateMode && employee && (
                     <Group gap="xs">
                        <Badge variant="light">{employee.position}</Badge>
                        <Badge variant="light" color={EMPLOYEE_STATUS_COLORS[employee.status]}>
                           {EMPLOYEE_STATUS_LABELS[employee.status]}
                        </Badge>
                     </Group>
                  )}
               </Stack>
            </Group>
            {!isCreateMode && (
               <Button
                  color="red"
                  variant="light"
                  onClick={onDeleteClick}
                  leftSection={<Trash2Icon size={16} />}
               >
                  {EMPLOYEE_PAGE_CONTENT.deleteEmployee}
               </Button>
            )}
         </Group>
      </>
   )
}

export { EmployeeHeader }
