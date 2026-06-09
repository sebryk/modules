import { useState } from 'react'

import {
   ActionIcon,
   Avatar,
   Badge,
   Button,
   Container,
   Group,
   Menu,
   Paper,
   ScrollArea,
   Select,
   Stack,
   Table,
   Text,
   TextInput,
   Title,
} from '@mantine/core'
import {
   EllipsisIcon,
   PencilIcon,
   SearchIcon,
   Trash2Icon,
} from 'lucide-react'

import { employeeStatusLabels, employees } from '@/shared/mocks/employees'

const ALL_DEPARTMENTS_VALUE = 'all-departments'
const ALL_STATUSES_VALUE = 'all-statuses'

const departmentOptions = [
   { value: ALL_DEPARTMENTS_VALUE, label: 'Все отделы' },
   ...Array.from(new Set(employees.map((employee) => employee.department))).map((department) => ({
      value: department,
      label: department,
   })),
]

const statusOptions = [
   { value: ALL_STATUSES_VALUE, label: 'Все статусы' },
   ...Object.entries(employeeStatusLabels).map(([value, label]) => ({
      value,
      label,
   })),
]

const getStatusColor = (status: keyof typeof employeeStatusLabels) => {
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

const TABLE_COLUMN_WIDTHS = {
   employee: 260,
   position: 220,
   department: 160,
   email: 240,
   status: 140,
   createdAt: 170,
   actions: 64,
} as const

const TeamPage = () => {
   const [searchValue, setSearchValue] = useState('')
   const [departmentValue, setDepartmentValue] = useState<string | null>(
      ALL_DEPARTMENTS_VALUE,
   )
   const [statusValue, setStatusValue] = useState<string | null>(ALL_STATUSES_VALUE)

   const normalizedSearch = searchValue.trim().toLowerCase()

   const filteredEmployees = employees.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase()
      const matchesSearch =
         !normalizedSearch ||
         fullName.includes(normalizedSearch) ||
         employee.email.toLowerCase().includes(normalizedSearch) ||
         employee.position.toLowerCase().includes(normalizedSearch)
      const matchesDepartment =
         !departmentValue ||
         departmentValue === ALL_DEPARTMENTS_VALUE ||
         employee.department === departmentValue
      const matchesStatus =
         !statusValue || statusValue === ALL_STATUSES_VALUE || employee.status === statusValue

      return matchesSearch && matchesDepartment && matchesStatus
   })

   return (
      <Container px="md" fluid={true}>
         <Stack gap="lg">
            <Stack gap={4}>
               <Title order={2}>Сотрудники</Title>
               <Text size="sm" c="dimmed">
                  Интерфейс собран на статических данных и подготовлен к подключению backend
                  списка пользователей и серверных фильтров.
               </Text>
            </Stack>

            <Paper p="lg" radius="lg" shadow="sm" withBorder={true}>
               <Stack gap="md">
                  <Group align="end" wrap="wrap" justify="space-between">
                     <Stack gap={2}>
                        <Text fw={600}>Фильтры</Text>
                        <Text size="sm" c="dimmed">
                           Поиск и фильтрация пока работают локально на фронтенде.
                        </Text>
                     </Stack>
                     <Button
                        variant="default"
                        onClick={() => {
                           setSearchValue('')
                           setDepartmentValue(ALL_DEPARTMENTS_VALUE)
                           setStatusValue(ALL_STATUSES_VALUE)
                        }}
                     >
                        Сбросить
                     </Button>
                  </Group>

                  <Group align="end" grow={true}>
                     <TextInput
                        label="Поиск"
                        value={searchValue}
                        placeholder="Имя, email или должность"
                        leftSection={<SearchIcon size={16} />}
                        onChange={(event) => {
                           setSearchValue(event.currentTarget.value)
                        }}
                     />
                     <Select
                        label="Отдел"
                        value={departmentValue}
                        data={departmentOptions}
                        onChange={setDepartmentValue}
                     />
                     <Select
                        label="Статус"
                        value={statusValue}
                        data={statusOptions}
                        onChange={setStatusValue}
                     />
                  </Group>
               </Stack>
            </Paper>

            <Paper radius="lg" shadow="sm" withBorder={true} style={{ overflow: 'hidden' }}>
               <Stack gap={0}>
                  <Group px="lg" py="md" justify="space-between">
                     <div>
                        <Text fw={600}>Список сотрудников</Text>
                        <Text size="sm" c="dimmed">
                           Найдено: {filteredEmployees.length}
                        </Text>
                     </div>
                  </Group>

                  <ScrollArea>
                     <Table
                        miw={1254}
                        verticalSpacing="md"
                        horizontalSpacing="lg"
                        highlightOnHover={true}
                        style={{ tableLayout: 'fixed' }}
                     >
                        <colgroup>
                           <col style={{ width: TABLE_COLUMN_WIDTHS.employee }} />
                           <col style={{ width: TABLE_COLUMN_WIDTHS.position }} />
                           <col style={{ width: TABLE_COLUMN_WIDTHS.department }} />
                           <col style={{ width: TABLE_COLUMN_WIDTHS.email }} />
                           <col style={{ width: TABLE_COLUMN_WIDTHS.status }} />
                           <col style={{ width: TABLE_COLUMN_WIDTHS.createdAt }} />
                           <col style={{ width: TABLE_COLUMN_WIDTHS.actions }} />
                        </colgroup>
                        <Table.Thead>
                           <Table.Tr>
                              <Table.Th>Сотрудник</Table.Th>
                              <Table.Th>Должность</Table.Th>
                              <Table.Th>Отдел</Table.Th>
                              <Table.Th>Email</Table.Th>
                              <Table.Th>Статус</Table.Th>
                              <Table.Th>Создан</Table.Th>
                              <Table.Th />
                           </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                           {filteredEmployees.map((employee) => {
                              const fullName = `${employee.firstName} ${employee.lastName}`

                              return (
                                 <Table.Tr key={employee.id}>
                                    <Table.Td>
                                       <Group gap="sm" wrap="nowrap">
                                          <Avatar radius="xl" color="blue">
                                             {employee.firstName[0]}
                                             {employee.lastName[0]}
                                          </Avatar>
                                          <div>
                                             <Text fw={500} size="sm">
                                                {fullName}
                                             </Text>
                                             <Text size="xs" c="dimmed">
                                                ID: {employee.id.slice(0, 8)}
                                             </Text>
                                          </div>
                                       </Group>
                                    </Table.Td>
                                    <Table.Td>
                                       <Text size="sm" truncate={true}>
                                          {employee.position}
                                       </Text>
                                    </Table.Td>
                                    <Table.Td>
                                       <Badge variant="light">{employee.department}</Badge>
                                    </Table.Td>
                                    <Table.Td>
                                       <Text size="sm" truncate={true}>
                                          {employee.email}
                                       </Text>
                                    </Table.Td>
                                    <Table.Td>
                                       <Badge variant="light" color={getStatusColor(employee.status)}>
                                          {employeeStatusLabels[employee.status]}
                                       </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                       <Text size="sm">{formatCreatedAt(employee.createdAt)}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                       <Group justify="flex-end">
                                          <Menu
                                             width={180}
                                             shadow="md"
                                             position="bottom-end"
                                          >
                                             <Menu.Target>
                                                <ActionIcon
                                                   color="gray"
                                                   variant="subtle"
                                                   aria-label={`Действия для ${fullName}`}
                                                >
                                                   <EllipsisIcon size={18} />
                                                </ActionIcon>
                                             </Menu.Target>

                                             <Menu.Dropdown>
                                                <Menu.Item leftSection={<PencilIcon size={16} />}>
                                                   Редактировать
                                                </Menu.Item>
                                                <Menu.Item
                                                   color="red"
                                                   leftSection={<Trash2Icon size={16} />}
                                                >
                                                   Удалить
                                                </Menu.Item>
                                             </Menu.Dropdown>
                                          </Menu>
                                       </Group>
                                    </Table.Td>
                                 </Table.Tr>
                              )
                           })}
                        </Table.Tbody>
                     </Table>
                  </ScrollArea>
               </Stack>
            </Paper>
         </Stack>
      </Container>
   )
}

export { TeamPage }
