import { Container, SimpleGrid, Stack } from '@mantine/core'

import { useEmployee } from '../model/use-employee'
import { EmployeeDeleteModal } from './employee-delete-modal'
import { EmployeeForm } from './employee-form'
import { EmployeeHeader } from './employee-header'
import { EmployeeNotFound } from './employee-not-found'
import { EmployeeProfile } from './employee-profile'

const EmployeePage = () => {
   const {
      employee,
      isCreateMode,
      draft,
      hasRequiredFieldsError,
      deleteOpened,
      closeDelete,
      openDelete,
      updateDraft,
      handleSubmit,
      handleDelete,
   } = useEmployee()

   if ((!employee && !isCreateMode) || !draft) {
      return <EmployeeNotFound />
   }

   return (
      <Container py="xs" fluid={true} bg="var(--mantine-color-dark-8)">
         <Stack gap="lg">
            <EmployeeHeader
               employee={employee}
               onDeleteClick={openDelete}
               isCreateMode={isCreateMode}
            />
            <SimpleGrid spacing="lg" cols={{ base: 1, md: 2 }}>
               <EmployeeProfile employee={employee} isCreateMode={isCreateMode} />
               <EmployeeForm
                  draft={draft}
                  onSubmit={handleSubmit}
                  isCreateMode={isCreateMode}
                  onDraftChange={updateDraft}
                  hasRequiredFieldsError={hasRequiredFieldsError}
               />
            </SimpleGrid>
         </Stack>
         {employee && (
            <EmployeeDeleteModal
               employee={employee}
               opened={deleteOpened}
               onClose={closeDelete}
               onConfirm={handleDelete}
            />
         )}
      </Container>
   )
}

export { EmployeePage }
