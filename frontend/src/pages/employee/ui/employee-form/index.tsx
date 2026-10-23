import type { EmployeeDraft } from '../../model/use-employee'
import type { EmployeePosition, EmployeeStatus } from '@/shared/mocks/employees'

import type { SubmitEventHandler } from 'react'

import {
   Button,
   Divider,
   Group,
   Paper,
   Select,
   SimpleGrid,
   Stack,
   Text,
   TextInput,
} from '@mantine/core'

import {
   EMPLOYEE_PAGE_CONTENT,
   EMPLOYEE_POSITION_OPTIONS,
   EMPLOYEE_STATUS_LABELS,
   EMPLOYEE_STATUS_OPTIONS,
} from '@/shared/data/employee-page'

type EmployeeFormProps = {
   draft: EmployeeDraft
   isCreateMode: boolean
   hasRequiredFieldsError: boolean
   onDraftChange: (patch: Partial<EmployeeDraft>) => void
   onSubmit: SubmitEventHandler<HTMLFormElement>
}

const isEmployeePosition = (value: string): value is EmployeePosition =>
   EMPLOYEE_POSITION_OPTIONS.some((position) => position === value)

const isEmployeeStatus = (value: string): value is EmployeeStatus =>
   EMPLOYEE_STATUS_OPTIONS.some((status) => status === value)

const EmployeeForm = ({
   draft,
   isCreateMode,
   hasRequiredFieldsError,
   onDraftChange,
   onSubmit,
}: EmployeeFormProps) => {
   const {
      title,
      description,
      firstName,
      lastName,
      email,
      position,
      status,
      requiredFieldsError,
      addEmployee,
      saveChanges,
   } = EMPLOYEE_PAGE_CONTENT.form

   return (
      <Paper p="lg" radius="lg" shadow="sm" component="form" withBorder={true} onSubmit={onSubmit}>
         <Stack gap="md">
            <div>
               <Text fw={600}>{title}</Text>
               <Text size="sm" c="dimmed">
                  {description}
               </Text>
            </div>
            <Divider />
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
               <TextInput
                  label={firstName}
                  value={draft.firstName}
                  onChange={(event) => onDraftChange({ firstName: event.currentTarget.value })}
               />
               <TextInput
                  label={lastName}
                  value={draft.lastName}
                  onChange={(event) => onDraftChange({ lastName: event.currentTarget.value })}
               />
            </SimpleGrid>
            <TextInput
               type="email"
               label={email}
               value={draft.email}
               onChange={(event) => onDraftChange({ email: event.currentTarget.value })}
            />
            <Select
               label={position}
               value={draft.position}
               data={EMPLOYEE_POSITION_OPTIONS}
               onChange={(value) => {
                  if (value && isEmployeePosition(value)) {
                     onDraftChange({ position: value })
                  }
               }}
            />
            <Select
               label={status}
               value={draft.status}
               data={EMPLOYEE_STATUS_OPTIONS.map((value) => ({
                  value,
                  label: EMPLOYEE_STATUS_LABELS[value],
               }))}
               onChange={(value) => {
                  if (value && isEmployeeStatus(value)) {
                     onDraftChange({ status: value })
                  }
               }}
            />
            {hasRequiredFieldsError && (
               <Text c="red" size="sm">
                  {requiredFieldsError}
               </Text>
            )}
            <Group justify="flex-end">
               <Button type="submit">{isCreateMode ? addEmployee : saveChanges}</Button>
            </Group>
         </Stack>
      </Paper>
   )
}

export { EmployeeForm }
