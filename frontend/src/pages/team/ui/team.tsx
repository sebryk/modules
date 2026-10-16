import { useEffect, useState } from 'react'

import {
   ActionIcon,
   Avatar,
   Badge,
   Button,
   Center,
   Container,
   Group,
   Menu,
   Modal,
   Pagination,
   Paper,
   ScrollArea,
   Select,
   Stack,
   Table,
   Text,
   TextInput,
   Title,
   UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
   ChevronsUpDownIcon,
   ChevronDownIcon,
   ChevronUpIcon,
   EllipsisIcon,
   PencilIcon,
   SearchIcon,
   Trash2Icon,
   UserPlusIcon,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { useEmployeesStore } from '@/entities/employee'
import {
   employeeStatusLabels,
   type EmployeePosition,
   type EmployeeRecord,
   type EmployeeStatus,
} from '@/shared/mocks/employees'

import classes from './styles.module.css'

const ALL_POSITIONS_VALUE = 'all-positions'
const ALL_STATUSES_VALUE = 'all-statuses'

type SortBy = 'createdAt' | 'email' | 'name' | 'position' | 'status'

const positionValues: EmployeePosition[] = [
   'Инженер',
   'Диспетчер',
   'Менеджер',
   'Бухгалтер',
   'Руководитель',
]

const positionOptions = [
   { value: ALL_POSITIONS_VALUE, label: 'Все должности' },
   ...positionValues.map((position) => ({
      value: position,
      label: position,
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

const positionColors: Record<EmployeePosition, string> = {
   Инженер: 'blue',
   Диспетчер: 'orange',
   Менеджер: 'grape',
   Бухгалтер: 'teal',
   Руководитель: 'red',
}

const employeeStatusOrder: Record<EmployeeStatus, number> = {
   active: 0,
   invited: 1,
   vacation: 2,
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
   email: 240,
   status: 140,
   createdAt: 170,
   actions: 64,
} as const

const PAGE_SIZE_OPTIONS = [
   { value: '5', label: '5 на странице' },
   { value: '10', label: '10 на странице' },
   { value: '20', label: '20 на странице' },
] as const

const TABLE_SECTION_BACKGROUND_COLOR =
   'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-7))'

const sortEmployees = (data: EmployeeRecord[], sortBy: SortBy, reversed: boolean) => {
   const sortedData = [...data].sort((left, right) => {
      if (sortBy === 'name') {
         const leftName = `${left.firstName} ${left.lastName}`
         const rightName = `${right.firstName} ${right.lastName}`

         return leftName.localeCompare(rightName, 'ru')
      }

      if (sortBy === 'position') {
         return left.position.localeCompare(right.position, 'ru')
      }

      if (sortBy === 'email') {
         return left.email.localeCompare(right.email, 'ru')
      }

      if (sortBy === 'status') {
         return employeeStatusOrder[left.status] - employeeStatusOrder[right.status]
      }

      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
   })

   if (reversed) {
      sortedData.reverse()
   }

   return sortedData
}

type SortableHeaderProps = {
   children: string
   reversed: boolean
   sorted: boolean
   onSort: () => void
}

const SortableHeader = ({ children, reversed, sorted, onSort }: SortableHeaderProps) => (
   <UnstyledButton onClick={onSort} className={classes['team-page__sort-button']}>
      <Group wrap="nowrap" justify="space-between">
         <Text fw={600} size="sm" className={classes['team-page__sort-button-label']}>
            {children}
         </Text>
         <Center className={classes['team-page__sort-icon']}>
            {sorted ? (
               reversed ? (
                  <ChevronDownIcon size={16} strokeWidth={1.5} />
               ) : (
                  <ChevronUpIcon size={16} strokeWidth={1.5} />
               )
            ) : (
               <ChevronsUpDownIcon size={16} strokeWidth={1.5} />
            )}
         </Center>
      </Group>
   </UnstyledButton>
)

const TeamPage = () => {
   const navigate = useNavigate()
   const employeeList = useEmployeesStore((state) => state.employees)
   const removeEmployee = useEmployeesStore((state) => state.removeEmployee)
   const [searchValue, setSearchValue] = useState('')
   const [positionValue, setPositionValue] = useState<string | null>(ALL_POSITIONS_VALUE)
   const [statusValue, setStatusValue] = useState<string | null>(ALL_STATUSES_VALUE)
   const [sortBy, setSortBy] = useState<SortBy>('createdAt')
   const [reverseSortDirection, setReverseSortDirection] = useState(true)
   const [page, setPage] = useState(1)
   const [pageSizeValue, setPageSizeValue] = useState<string | null>('10')
   const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeRecord | null>(null)
   const [deleteOpened, { close: closeDelete, open: openDelete }] = useDisclosure(false)

   const normalizedSearch = searchValue.trim().toLowerCase()

   const filteredEmployees = employeeList.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase()
      const matchesSearch =
         !normalizedSearch ||
         fullName.includes(normalizedSearch) ||
         employee.email.toLowerCase().includes(normalizedSearch) ||
         employee.position.toLowerCase().includes(normalizedSearch)
      const matchesPosition =
         !positionValue ||
         positionValue === ALL_POSITIONS_VALUE ||
         employee.position === positionValue
      const matchesStatus =
         !statusValue || statusValue === ALL_STATUSES_VALUE || employee.status === statusValue

      return matchesSearch && matchesPosition && matchesStatus
   })

   const sortedEmployees = sortEmployees(filteredEmployees, sortBy, reverseSortDirection)
   const pageSize = Number(pageSizeValue ?? '10')
   const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / pageSize))
   const paginatedEmployees = sortedEmployees.slice((page - 1) * pageSize, page * pageSize)

   const setSorting = (field: SortBy) => {
      const reversed = field === sortBy ? !reverseSortDirection : false

      setReverseSortDirection(reversed)
      setSortBy(field)
   }

   const requestDelete = (employee: EmployeeRecord) => {
      setEmployeeToDelete(employee)
      openDelete()
   }

   const confirmDelete = () => {
      if (!employeeToDelete) {
         return
      }

      removeEmployee(employeeToDelete.id)
      closeDelete()
      setEmployeeToDelete(null)
      notifications.show({
         title: 'Сотрудник удалён',
         message: `${employeeToDelete.firstName} ${employeeToDelete.lastName} удалён из списка`,
         color: 'green',
      })
   }

   useEffect(() => {
      setPage(1)
   }, [searchValue, positionValue, statusValue, pageSize])

   useEffect(() => {
      if (page > totalPages) {
         setPage(totalPages)
      }
   }, [page, totalPages])

   return (
      <Container py="xs" fluid={true} bg="var(--mantine-color-dark-8)">
         <Stack gap="lg">
            <Group gap="sm" wrap="wrap" align="center" justify="space-between">
               <Title order={2}>Сотрудники</Title>
               <Button
                  leftSection={<UserPlusIcon size={16} />}
                  onClick={() => {
                     navigate('/team/new')
                  }}
               >
                  Добавить сотрудника
               </Button>
            </Group>

            <Paper p="lg" radius="lg" shadow="sm" withBorder={true}>
               <Stack gap="md">
                  <Group align="end" wrap="wrap" justify="space-between">
                     <Stack gap={2}>
                        <Text fw={600}>Фильтры</Text>
                        <Text size="sm" c="dimmed">
                           Поиск и фильтрация
                        </Text>
                     </Stack>
                     <Button
                        variant="default"
                        onClick={() => {
                           setSearchValue('')
                           setPositionValue(ALL_POSITIONS_VALUE)
                           setStatusValue(ALL_STATUSES_VALUE)
                           setPageSizeValue('10')
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
                        label="Должность"
                        value={positionValue}
                        data={positionOptions}
                        onChange={setPositionValue}
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
                  <ScrollArea>
                     <Table
                        miw={1094}
                        verticalSpacing="md"
                        horizontalSpacing="lg"
                        highlightOnHover={true}
                        style={{ tableLayout: 'fixed' }}
                     >
                        <colgroup>
                           <col style={{ width: TABLE_COLUMN_WIDTHS.employee }} />
                           <col style={{ width: TABLE_COLUMN_WIDTHS.position }} />
                           <col style={{ width: TABLE_COLUMN_WIDTHS.email }} />
                           <col style={{ width: TABLE_COLUMN_WIDTHS.status }} />
                           <col style={{ width: TABLE_COLUMN_WIDTHS.createdAt }} />
                           <col style={{ width: TABLE_COLUMN_WIDTHS.actions }} />
                        </colgroup>
                        <Table.Thead style={{ backgroundColor: TABLE_SECTION_BACKGROUND_COLOR }}>
                           <Table.Tr>
                              <Table.Th>
                                 <SortableHeader
                                    sorted={sortBy === 'name'}
                                    reversed={reverseSortDirection}
                                    onSort={() => {
                                       setSorting('name')
                                    }}
                                 >
                                    Сотрудник
                                 </SortableHeader>
                              </Table.Th>
                              <Table.Th>
                                 <SortableHeader
                                    sorted={sortBy === 'position'}
                                    reversed={reverseSortDirection}
                                    onSort={() => {
                                       setSorting('position')
                                    }}
                                 >
                                    Должность
                                 </SortableHeader>
                              </Table.Th>
                              <Table.Th>
                                 <SortableHeader
                                    sorted={sortBy === 'email'}
                                    reversed={reverseSortDirection}
                                    onSort={() => {
                                       setSorting('email')
                                    }}
                                 >
                                    Email
                                 </SortableHeader>
                              </Table.Th>
                              <Table.Th>
                                 <SortableHeader
                                    sorted={sortBy === 'status'}
                                    reversed={reverseSortDirection}
                                    onSort={() => {
                                       setSorting('status')
                                    }}
                                 >
                                    Статус
                                 </SortableHeader>
                              </Table.Th>
                              <Table.Th>
                                 <SortableHeader
                                    sorted={sortBy === 'createdAt'}
                                    reversed={reverseSortDirection}
                                    onSort={() => {
                                       setSorting('createdAt')
                                    }}
                                 >
                                    Создан
                                 </SortableHeader>
                              </Table.Th>
                              <Table.Th />
                           </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                           {paginatedEmployees.map((employee) => {
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
                                             <Button
                                                px={0}
                                                component={Link}
                                                variant="subtle"
                                                size="compact-sm"
                                                to={`/team/${employee.id}`}
                                                className={classes['team-page__employee-link']}
                                             >
                                                {fullName}
                                             </Button>
                                             <Text size="xs" c="dimmed">
                                                ID: {employee.id.slice(0, 8)}
                                             </Text>
                                          </div>
                                       </Group>
                                    </Table.Td>
                                    <Table.Td>
                                       <Badge
                                          radius="sm"
                                          fw="initial"
                                          variant="light"
                                          color={positionColors[employee.position]}
                                       >
                                          {employee.position}
                                       </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                       <Text size="sm" truncate={true}>
                                          {employee.email}
                                       </Text>
                                    </Table.Td>
                                    <Table.Td>
                                       <Group gap="xs" wrap="nowrap">
                                          <Text
                                             lh={1}
                                             size="lg"
                                             c={getStatusColor(employee.status)}
                                          >
                                             •
                                          </Text>
                                          <Text size="sm">
                                             {employeeStatusLabels[employee.status]}
                                          </Text>
                                       </Group>
                                    </Table.Td>
                                    <Table.Td>
                                       <Text size="sm">{formatCreatedAt(employee.createdAt)}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                       <Group justify="flex-end">
                                          <Menu width={180} shadow="md" position="bottom-end">
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
                                                <Menu.Item
                                                   leftSection={<PencilIcon size={16} />}
                                                   onClick={() => {
                                                      navigate(`/team/${employee.id}`)
                                                   }}
                                                >
                                                   Редактировать
                                                </Menu.Item>
                                                <Menu.Item
                                                   color="red"
                                                   leftSection={<Trash2Icon size={16} />}
                                                   onClick={() => {
                                                      requestDelete(employee)
                                                   }}
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

                  <Group
                     px="lg"
                     py="md"
                     wrap="wrap"
                     justify="space-between"
                     style={{
                        backgroundColor: TABLE_SECTION_BACKGROUND_COLOR,
                        borderTop: '1px solid var(--mantine-color-dark-4)',
                     }}
                  >
                     <Text size="sm" c="dimmed">
                        Показано {paginatedEmployees.length} из {filteredEmployees.length}{' '}
                        сотрудников
                     </Text>
                     <Group wrap="wrap">
                        <Select
                           w={170}
                           value={pageSizeValue}
                           data={PAGE_SIZE_OPTIONS}
                           onChange={setPageSizeValue}
                           aria-label="Количество строк на странице"
                        />
                        <Pagination value={page} total={totalPages} onChange={setPage} />
                     </Group>
                  </Group>
               </Stack>
            </Paper>
         </Stack>

         <Modal
            centered={true}
            opened={deleteOpened}
            title="Удалить сотрудника?"
            onClose={() => {
               closeDelete()
               setEmployeeToDelete(null)
            }}
         >
            <Stack gap="md">
               <Text size="sm" c="dimmed">
                  Запись{' '}
                  {employeeToDelete
                     ? `${employeeToDelete.firstName} ${employeeToDelete.lastName}`
                     : ''}{' '}
                  будет удалена из локального списка. Это действие нельзя отменить.
               </Text>
               <Group justify="flex-end">
                  <Button
                     variant="default"
                     onClick={() => {
                        closeDelete()
                        setEmployeeToDelete(null)
                     }}
                  >
                     Отмена
                  </Button>
                  <Button color="red" onClick={confirmDelete}>
                     Удалить
                  </Button>
               </Group>
            </Stack>
         </Modal>
      </Container>
   )
}

export { TeamPage }
