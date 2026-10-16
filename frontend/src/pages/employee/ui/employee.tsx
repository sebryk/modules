import { useEffect, useState } from 'react'

import {
   Avatar,
   Badge,
   Breadcrumbs,
   Button,
   Container,
   Divider,
   Group,
   Modal,
   Paper,
   Select,
   SimpleGrid,
   Stack,
   Text,
   TextInput,
   Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { ArrowLeftIcon, MailIcon, Trash2Icon } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'

import { useEmployeesStore } from '@/entities/employee'
import { ROUTES } from '@/shared/config/routes'
import {
   employeeStatusLabels,
   type EmployeePosition,
   type EmployeeRecord,
   type EmployeeStatus,
} from '@/shared/mocks/employees'

import classes from './styles.module.css'

const positionOptions: EmployeePosition[] = [
   'Инженер',
   'Диспетчер',
   'Менеджер',
   'Бухгалтер',
   'Руководитель',
]

const statusOptions: EmployeeStatus[] = ['active', 'invited', 'vacation']

const emptyDraft: EmployeeDraft = {
   email: '',
   firstName: '',
   lastName: '',
   position: 'Инженер',
   status: 'active',
}

const getStatusColor = (status: EmployeeStatus) => {
   if (status === 'active') {
      return 'green'
   }

   if (status === 'vacation') {
      return 'yellow'
   }

   return 'blue'
}

const formatCreatedAt = (value: string) =>
   new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
   }).format(new Date(value))

const getFullName = (employee: EmployeeRecord) => `${employee.firstName} ${employee.lastName}`

type EmployeeDraft = Pick<
   EmployeeRecord,
   'email' | 'firstName' | 'lastName' | 'position' | 'status'
>

const getDraft = (employee: EmployeeRecord): EmployeeDraft => ({
   email: employee.email,
   firstName: employee.firstName,
   lastName: employee.lastName,
   position: employee.position,
   status: employee.status,
})

const EmployeePage = () => {
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
   const [formError, setFormError] = useState<string | null>(null)
   const [deleteOpened, { close: closeDelete, open: openDelete }] = useDisclosure(false)

   useEffect(() => {
      setDraft(isCreateMode ? emptyDraft : employee ? getDraft(employee) : null)
      setFormError(null)
   }, [employee, isCreateMode])

   if ((!employee && !isCreateMode) || !draft) {
      return (
         <Container py="xl" fluid={true} bg="var(--mantine-color-dark-8)">
            <Paper p="xl" radius="lg" withBorder={true}>
               <Stack gap="sm" align="center">
                  <Title order={2}>Сотрудник не найден</Title>
                  <Text c="dimmed">Запись могла быть удалена или ссылка устарела.</Text>
                  <Button component={Link} to={ROUTES.team} leftSection={<ArrowLeftIcon size={16} />}>
                     Вернуться к сотрудникам
                  </Button>
               </Stack>
            </Paper>
         </Container>
      )
   }

   const fullName = employee ? getFullName(employee) : 'Новый сотрудник'
   const initials = employee
      ? `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`
      : '?'

   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.email.trim()) {
         setFormError('Заполните имя, фамилию и email')
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
            title: 'Сотрудник добавлен',
            message: 'Новый сотрудник добавлен в локальный список',
            color: 'green',
         })
         navigate(ROUTES.team)
         return
      }

      if (!employee) {
         return
      }

      updateEmployee(employee.id, employeeData)
      setFormError(null)
      notifications.show({
         title: 'Изменения сохранены',
         message: 'Данные сотрудника обновлены локально',
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
         title: 'Сотрудник удалён',
         message: `${fullName} удалён из списка`,
         color: 'green',
      })
      navigate(ROUTES.team)
   }

   return (
      <Container py="xs" fluid={true} bg="var(--mantine-color-dark-8)">
         <Stack gap="lg">
            <Breadcrumbs separator="/" className={classes['employee-page__breadcrumbs']}>
               <Button px={0} component={Link} to={ROUTES.team} variant="subtle">
                  Сотрудники
               </Button>
               <Text size="sm">{isCreateMode ? 'Добавление' : fullName}</Text>
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
                           <Badge variant="light" color={getStatusColor(employee.status)}>
                              {employeeStatusLabels[employee.status]}
                           </Badge>
                        </Group>
                     )}
                  </Stack>
               </Group>
               {!isCreateMode && (
                  <Button color="red" variant="light" onClick={openDelete} leftSection={<Trash2Icon size={16} />}>
                     Удалить сотрудника
                  </Button>
               )}
            </Group>

            <SimpleGrid spacing="lg" cols={{ base: 1, md: 2 }}>
               <Paper p="lg" radius="lg" shadow="sm" withBorder={true}>
                  <Stack gap="md">
                     <div>
                     <Text fw={600}>Профиль</Text>
                     <Text size="sm" c="dimmed">
                           {isCreateMode ? 'Заполните данные нового сотрудника' : 'Основная информация о сотруднике'}
                        </Text>
                     </div>
                     <Divider />
                     <Group gap="sm" wrap="nowrap">
                        <MailIcon size={18} className={classes['employee-page__muted-icon']} />
                        <div>
                           <Text size="xs" c="dimmed">Email</Text>
                     <Text size="sm">{employee?.email || 'Email будет указан после сохранения'}</Text>
                        </div>
                     </Group>
                     {employee && <div>
                        <Text size="xs" c="dimmed">Сотрудник с нами</Text>
                        <Text size="sm">{formatCreatedAt(employee.createdAt)}</Text>
                     </div>}
                  </Stack>
               </Paper>

               <Paper p="lg" radius="lg" shadow="sm" component="form" withBorder={true} onSubmit={handleSubmit}>
                  <Stack gap="md">
                     <div>
                        <Text fw={600}>Данные сотрудника</Text>
                        <Text size="sm" c="dimmed">Изменения сохраняются только на фронте</Text>
                     </div>
                     <Divider />
                     <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <TextInput
                           label="Имя"
                           value={draft.firstName}
                           onChange={(event) => setDraft({ ...draft, firstName: event.currentTarget.value })}
                        />
                        <TextInput
                           label="Фамилия"
                           value={draft.lastName}
                           onChange={(event) => setDraft({ ...draft, lastName: event.currentTarget.value })}
                        />
                     </SimpleGrid>
                     <TextInput
                        type="email"
                        label="Email"
                        value={draft.email}
                        onChange={(event) => setDraft({ ...draft, email: event.currentTarget.value })}
                     />
                     <Select
                        label="Должность"
                        value={draft.position}
                        data={positionOptions}
                        onChange={(value) => {
                           if (value && positionOptions.includes(value as EmployeePosition)) {
                              setDraft({ ...draft, position: value as EmployeePosition })
                           }
                        }}
                     />
                     <Select
                        label="Статус"
                        value={draft.status}
                        data={statusOptions.map((status) => ({
                           value: status,
                           label: employeeStatusLabels[status],
                        }))}
                        onChange={(value) => {
                           if (value && statusOptions.includes(value as EmployeeStatus)) {
                              setDraft({ ...draft, status: value as EmployeeStatus })
                           }
                        }}
                     />
                     {formError && <Text c="red" size="sm">{formError}</Text>}
                     <Group justify="flex-end">
                           <Button type="submit">
                              {isCreateMode ? 'Добавить сотрудника' : 'Сохранить изменения'}
                           </Button>
                     </Group>
                  </Stack>
               </Paper>
            </SimpleGrid>
         </Stack>

         <Modal centered={true} opened={deleteOpened} onClose={closeDelete} title="Удалить сотрудника?">
            <Stack gap="md">
               <Text size="sm" c="dimmed">
                  Запись {fullName} будет удалена из локального списка. Это действие нельзя отменить.
               </Text>
               <Group justify="flex-end">
                  <Button variant="default" onClick={closeDelete}>Отмена</Button>
                  <Button color="red" onClick={handleDelete}>Удалить</Button>
               </Group>
            </Stack>
         </Modal>
      </Container>
   )
}

export { EmployeePage }
