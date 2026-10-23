import type { EmployeeRecord } from '@/shared/mocks/employees'

import { Button, Group, Modal, Stack, Text } from '@mantine/core'

import { EMPLOYEE_PAGE_CONTENT } from '@/shared/data/employee-page'

type EmployeeDeleteModalProps = {
   employee: EmployeeRecord
   opened: boolean
   onClose: () => void
   onConfirm: () => void
}

const EmployeeDeleteModal = ({
   employee,
   opened,
   onClose,
   onConfirm,
}: EmployeeDeleteModalProps) => {
   const { title, description, cancel, confirm } = EMPLOYEE_PAGE_CONTENT.deleteDialog
   const fullName = `${employee.firstName} ${employee.lastName}`

   return (
      <Modal title={title} centered={true} opened={opened} onClose={onClose}>
         <Stack gap="md">
            <Text size="sm" c="dimmed">
               {description(fullName)}
            </Text>
            <Group justify="flex-end">
               <Button variant="default" onClick={onClose}>
                  {cancel}
               </Button>
               <Button color="red" onClick={onConfirm}>
                  {confirm}
               </Button>
            </Group>
         </Stack>
      </Modal>
   )
}

export { EmployeeDeleteModal }
