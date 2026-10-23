import type { EmployeePosition, EmployeeStatus } from '@/shared/mocks/employees'

const EMPLOYEE_POSITION_OPTIONS: EmployeePosition[] = [
   'Инженер',
   'Диспетчер',
   'Менеджер',
   'Бухгалтер',
   'Руководитель',
]

const EMPLOYEE_STATUS_OPTIONS: EmployeeStatus[] = ['active', 'invited', 'vacation']

const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
   active: 'Активен',
   invited: 'Приглашён',
   vacation: 'В отпуске',
}

const EMPLOYEE_STATUS_COLORS: Record<EmployeeStatus, string> = {
   active: 'green',
   invited: 'blue',
   vacation: 'yellow',
}

const EMPLOYEE_PAGE_CONTENT = {
   breadcrumbSeparator: '/',
   teamLink: 'Сотрудники',
   createBreadcrumb: 'Добавление',
   newEmployeeName: 'Новый сотрудник',
   newEmployeeInitials: '?',
   deleteEmployee: 'Удалить сотрудника',
   notFound: {
      title: 'Сотрудник не найден',
      description: 'Запись могла быть удалена или ссылка устарела.',
      backToEmployees: 'Вернуться к сотрудникам',
   },
   profile: {
      title: 'Профиль',
      createDescription: 'Заполните данные нового сотрудника',
      employeeDescription: 'Основная информация о сотруднике',
      emailLabel: 'Email',
      emailAfterSave: 'Email будет указан после сохранения',
      employeeSince: 'Сотрудник с нами',
   },
   form: {
      title: 'Данные сотрудника',
      description: 'Изменения сохраняются только на фронте',
      firstName: 'Имя',
      lastName: 'Фамилия',
      email: 'Email',
      position: 'Должность',
      status: 'Статус',
      requiredFieldsError: 'Заполните имя, фамилию и email',
      addEmployee: 'Добавить сотрудника',
      saveChanges: 'Сохранить изменения',
   },
   deleteDialog: {
      title: 'Удалить сотрудника?',
      description: (fullName: string) =>
         `Запись ${fullName} будет удалена из локального списка. Это действие нельзя отменить.`,
      cancel: 'Отмена',
      confirm: 'Удалить',
   },
   notifications: {
      created: {
         title: 'Сотрудник добавлен',
         message: 'Новый сотрудник добавлен в локальный список',
      },
      updated: {
         title: 'Изменения сохранены',
         message: 'Данные сотрудника обновлены локально',
      },
      deleted: {
         title: 'Сотрудник удалён',
         message: (fullName: string) => `${fullName} удалён из списка`,
      },
   },
}

export {
   EMPLOYEE_PAGE_CONTENT,
   EMPLOYEE_STATUS_COLORS,
   EMPLOYEE_STATUS_LABELS,
   EMPLOYEE_STATUS_OPTIONS,
   EMPLOYEE_POSITION_OPTIONS,
}
