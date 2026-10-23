const ALL_POSITIONS_VALUE = 'all-positions'
const ALL_STATUSES_VALUE = 'all-statuses'
const DEFAULT_PAGE_SIZE_VALUE = '10'

const TEAM_HEADER_CONTENT = {
   title: 'Сотрудники',
   addEmployee: 'Добавить сотрудника',
}

const TEAM_FILTERS_CONTENT = {
   title: 'Фильтры',
   subtitle: 'Поиск и фильтрация',
   reset: 'Сбросить',
   searchLabel: 'Поиск',
   searchPlaceholder: 'Имя, email или должность',
   positionLabel: 'Должность',
   statusLabel: 'Статус',
}

const POSITION_VALUES = ['Инженер', 'Диспетчер', 'Менеджер', 'Бухгалтер', 'Руководитель']

const POSITION_OPTIONS = [
   { value: ALL_POSITIONS_VALUE, label: 'Все должности' },
   ...POSITION_VALUES.map((position) => ({ value: position, label: position })),
]

const EMPLOYEE_STATUS_LABELS = {
   active: 'Активен',
   invited: 'Приглашён',
   vacation: 'В отпуске',
}

const STATUS_OPTIONS = [
   { value: ALL_STATUSES_VALUE, label: 'Все статусы' },
   ...Object.entries(EMPLOYEE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

const TEAM_COLUMN_LABELS = {
   name: 'Сотрудник',
   position: 'Должность',
   email: 'Email',
   status: 'Статус',
   createdAt: 'Создан',
}

const TEAM_SORT_FIELDS: (keyof typeof TEAM_COLUMN_LABELS)[] = [
   'name',
   'position',
   'email',
   'status',
   'createdAt',
]

const TABLE_COLUMN_WIDTHS = {
   name: 260,
   position: 220,
   email: 240,
   status: 140,
   createdAt: 170,
   actions: 64,
}

const TABLE_MIN_WIDTH = 1094
const TABLE_SECTION_BACKGROUND_COLOR =
   'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-7))'

const POSITION_COLORS: Partial<Record<string, string>> = {
   Инженер: 'blue',
   Диспетчер: 'orange',
   Менеджер: 'grape',
   Бухгалтер: 'teal',
   Руководитель: 'red',
}

const EMPLOYEE_STATUS_COLORS = {
   active: 'green',
   invited: 'blue',
   vacation: 'yellow',
}

const TEAM_ROW_CONTENT = {
   statusIndicator: '•',
   edit: 'Редактировать',
   delete: 'Удалить',
   employeeId: (id: string) => `ID: ${id.slice(0, 8)}`,
   actionsLabel: (fullName: string) => `Действия для ${fullName}`,
}

const PAGE_SIZE_OPTIONS = [
   { value: '5', label: '5 на странице' },
   { value: '10', label: '10 на странице' },
   { value: '20', label: '20 на странице' },
]

const TEAM_PAGINATION_CONTENT = {
   pageSizeLabel: 'Количество строк на странице',
   summary: (shownCount: number, totalCount: number) =>
      `Показано ${shownCount} из ${totalCount} сотрудников`,
}

const TEAM_TABLE_CONTENT = {
   loading: 'Загружаем сотрудников…',
   empty: 'Сотрудники не найдены',
   emptyDescription: 'Измените условия поиска или сбросьте фильтры.',
   errorTitle: 'Не удалось загрузить сотрудников',
   errorDescription: 'Проверьте подключение и попробуйте ещё раз.',
   forbidden: 'У вас нет доступа к списку сотрудников.',
   retry: 'Повторить запрос',
}

export {
   STATUS_OPTIONS,
   POSITION_COLORS,
   TABLE_MIN_WIDTH,
   POSITION_OPTIONS,
   TEAM_ROW_CONTENT,
   TEAM_SORT_FIELDS,
   PAGE_SIZE_OPTIONS,
   ALL_STATUSES_VALUE,
   TEAM_COLUMN_LABELS,
   TEAM_TABLE_CONTENT,
   ALL_POSITIONS_VALUE,
   TABLE_COLUMN_WIDTHS,
   TEAM_HEADER_CONTENT,
   TEAM_FILTERS_CONTENT,
   EMPLOYEE_STATUS_LABELS,
   EMPLOYEE_STATUS_COLORS,
   DEFAULT_PAGE_SIZE_VALUE,
   TEAM_PAGINATION_CONTENT,
   TABLE_SECTION_BACKGROUND_COLOR,
}
