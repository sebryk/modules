import type { EmployeeRecord } from '@/shared/mocks/employees'

import { useEffect, useState, type SubmitEventHandler } from 'react'

import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useNavigate, useParams } from 'react-router'

import { useEmployeesStore } from '@/entities/employee'
import { ROUTES } from '@/shared/config/routes'
import { EMPLOYEE_PAGE_CONTENT, EMPLOYEE_POSITION_OPTIONS } from '@/shared/data/employee-page'

type EmployeeDraft = Pick<
   EmployeeRecord,
   'email' | 'firstName' | 'lastName' | 'position' | 'status'
>

const emptyDraft: EmployeeDraft = {
   email: '',
   firstName: '',
   lastName: '',
   position: EMPLOYEE_POSITION_OPTIONS[0],
   status: 'active',
}

const getDraft = (employee: EmployeeRecord): EmployeeDraft => ({
   email: employee.email,
   firstName: employee.firstName,
   lastName: employee.lastName,
   position: employee.position,
   status: employee.status,
})

const getFullName = (employee: EmployeeRecord) => `${employee.firstName} ${employee.lastName}`

const useEmployee = () => {
   const { employeeId } = useParams<{ employeeId: string }>()
   const isCreateMode = employeeId === 'new'
   const navigate = useNavigate()
   const employee = useEmployeesStore((state) =>
      employeeId ? state.getEmployee(employeeId) : undefined,
   )
   const addEmployee = useEmployeesStore((state) => state.addEmployee)
   const updateEmployee = useEmployeesStore((state) => state.updateEmployee)
   const removeEmployee = useEmployeesStore((state) => state.removeEmployee)
   const [draft, setDraft] = useState<EmployeeDraft | null>(
      isCreateMode ? emptyDraft : employee ? getDraft(employee) : null,
   )
   const [hasRequiredFieldsError, setHasRequiredFieldsError] = useState(false)
   const [deleteOpened, { close: closeDelete, open: openDelete }] = useDisclosure(false)

   useEffect(() => {
      setDraft(isCreateMode ? emptyDraft : employee ? getDraft(employee) : null)
      setHasRequiredFieldsError(false)
   }, [employee, isCreateMode])

   const updateDraft = (patch: Partial<EmployeeDraft>) => {
      setDraft((currentDraft) => (currentDraft ? { ...currentDraft, ...patch } : currentDraft))
   }

   const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
      event.preventDefault()

      if (!draft?.firstName.trim() || !draft.lastName.trim() || !draft.email.trim()) {
         setHasRequiredFieldsError(true)
         return
      }

      const employeeData = {
         ...draft,
         firstName: draft.firstName.trim(),
         lastName: draft.lastName.trim(),
         email: draft.email.trim(),
      }

      if (isCreateMode) {
         addEmployee({ ...employeeData, createdAt: new Date().toISOString() })
         notifications.show({
            title: EMPLOYEE_PAGE_CONTENT.notifications.created.title,
            message: EMPLOYEE_PAGE_CONTENT.notifications.created.message,
            color: 'green',
         })
         navigate(ROUTES.team)
         return
      }

      if (!employee) {
         return
      }

      updateEmployee(employee.id, employeeData)
      setHasRequiredFieldsError(false)
      notifications.show({
         title: EMPLOYEE_PAGE_CONTENT.notifications.updated.title,
         message: EMPLOYEE_PAGE_CONTENT.notifications.updated.message,
         color: 'green',
      })
   }

   const handleDelete = () => {
      if (!employee) {
         return
      }

      removeEmployee(employee.id)
      closeDelete()
      notifications.show({
         title: EMPLOYEE_PAGE_CONTENT.notifications.deleted.title,
         message: EMPLOYEE_PAGE_CONTENT.notifications.deleted.message(getFullName(employee)),
         color: 'green',
      })
      navigate(ROUTES.team)
   }

   return {
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
   }
}

export { useEmployee }
export type { EmployeeDraft }
