import { create } from 'zustand'

import { employees, type EmployeeRecord } from '@/shared/mocks/employees'

type EmployeePatch = Partial<Omit<EmployeeRecord, 'id'>>

type EmployeesState = {
   employees: EmployeeRecord[]
   addEmployee: (employee: Omit<EmployeeRecord, 'id'>) => string
   getEmployee: (id: string) => EmployeeRecord | undefined
   removeEmployee: (id: string) => void
   updateEmployee: (id: string, patch: EmployeePatch) => void
}

const useEmployeesStore = create<EmployeesState>((set, get) => ({
   employees: [...employees],
   addEmployee: (employee) => {
      const id = crypto.randomUUID()

      set((state) => ({
         employees: [...state.employees, { ...employee, id }],
      }))

      return id
   },
   getEmployee: (id) => get().employees.find((employee) => employee.id === id),
   removeEmployee: (id) => {
      set((state) => ({
         employees: state.employees.filter((employee) => employee.id !== id),
      }))
   },
   updateEmployee: (id, patch) => {
      set((state) => ({
         employees: state.employees.map((employee) =>
            employee.id === id ? { ...employee, ...patch } : employee,
         ),
      }))
   },
}))

export { useEmployeesStore }
export type { EmployeePatch }
