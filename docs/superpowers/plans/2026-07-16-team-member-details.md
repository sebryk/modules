# Страница сотрудника и локальное редактирование Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Добавить страницу сотрудника с фото-заглушкой, локальным редактированием и удалением, связав её с командной таблицей.

**Architecture:** Zustand store станет единым источником локального списка сотрудников для таблицы и страницы `/team/:employeeId`. Страница сотрудника будет отдельным FSD page-модулем на Mantine; таблица сохранит свои фильтры/сортировку/пагинацию, но будет навигировать к записи и вызывать store для удаления.

**Tech Stack:** React 19, TypeScript, React Router 7, Mantine 8, Zustand 5, lucide-react, Vite.

## Global Constraints

- Использовать текущую визуальную систему приложения и Mantine-компоненты.
- Backend/API не изменять; все изменения только в локальном состоянии фронтенда.
- Фото пока не загружается: при отсутствии URL показывать `Avatar` с инициалами.
- Сохранение формы не меняет таблицу до явного нажатия «Сохранить изменения».

---

### Task 1: Локальное состояние сотрудников

**Files:**
- Create: `frontend/src/entities/employee/model/use-employees-store.ts`
- Modify: `frontend/src/shared/mocks/employees.ts`

**Interfaces:**
- Produces `useEmployeesStore` with `employees`, `updateEmployee(id, patch)`, `removeEmployee(id)`, `getEmployee(id)`.
- `EmployeeRecord` gains optional `avatarUrl?: string`.

- [ ] **Step 1: Добавить optional-поле фото в `EmployeeRecord` и оставить mock-записи без URL**, чтобы UI проверял состояние заглушки.
- [ ] **Step 2: Создать Zustand store, инициализировав `employees` копией mock-данных**, и реализовать обновление только выбранной записи по `id`.
- [ ] **Step 3: Добавить barrel export `frontend/src/entities/employee/index.ts`**, чтобы страницы не импортировали store из глубокой папки.
- [ ] **Step 4: Запустить `yarn typecheck` из `frontend` и убедиться, что store типизируется без ошибок.**

### Task 2: Маршрут и страница сотрудника

**Files:**
- Create: `frontend/src/pages/employee/index.ts`
- Create: `frontend/src/pages/employee/ui/employee.tsx`
- Create: `frontend/src/pages/employee/ui/styles.module.css`
- Modify: `frontend/src/app/router.tsx`
- Modify: `frontend/src/shared/config/routes.ts`

**Interfaces:**
- Consumes `useEmployeesStore`, `EmployeeRecord`, existing `employeeStatusLabels` and position/status types.
- Produces `EmployeePage` rendered for `/team/:employeeId`.

- [ ] **Step 1: Добавить `ROUTES.employee = '/team/:employeeId'` и route `team/:employeeId` под существующей permission-защитой.**
- [ ] **Step 2: В `EmployeePage` получить `employeeId` через `useParams`, найти запись через store и вернуть состояние «Сотрудник не найден» для неизвестного id.**
- [ ] **Step 3: Собрать Mantine-layout страницы:** кнопка возврата, `Breadcrumbs`, карточка профиля, `Avatar`/заглушка с инициалами, email, должность, статус и дата создания.
- [ ] **Step 4: Добавить форму с `TextInput` для имени/фамилии/email и `Select` для должности/статуса; локально хранить draft и обновлять store только после submit.**
- [ ] **Step 5: Добавить `Modal` подтверждения удаления, вызвать `removeEmployee`, показать notification и перейти на `/team`; добавить уведомление после успешного сохранения.**
- [ ] **Step 6: Запустить `yarn build` и проверить, что новый маршрут собирается.**

### Task 3: Связать таблицу с карточкой и store

**Files:**
- Modify: `frontend/src/pages/team/ui/team.tsx`
- Modify: `frontend/src/pages/team/ui/styles.module.css`

**Interfaces:**
- Consumes `useEmployeesStore` and `EmployeePage` route.
- Preserves existing table filtering, sorting, page size, pagination and permission behavior.

- [ ] **Step 1: Заменить импорт статического `employees` на список из `useEmployeesStore`, а position options строить из доступных mock-данных без изменения текущих подписей.**
- [ ] **Step 2: Сделать имя сотрудника `Button`/`Anchor`-ссылкой на `/team/${employee.id}` с доступным текстом; сохранить ID и Avatar.**
- [ ] **Step 3: Подключить пункт «Редактировать» к навигации на страницу сотрудника.**
- [ ] **Step 4: Подключить удаление через общее подтверждение и `removeEmployee`; после удаления скорректировать текущую страницу, если последний элемент был удалён.**
- [ ] **Step 5: Добавить небольшие focus/hover-стили для ссылки имени в существующем CSS module и проверить адаптивность таблицы.**
- [ ] **Step 6: Запустить `yarn lint` и `yarn build` из `frontend`.**

### Task 4: Финальная проверка сценариев

**Files:**
- No source changes expected.

- [ ] **Step 1: Запустить `yarn typecheck`, `yarn lint` и `yarn build` из `frontend`.**
- [ ] **Step 2: В dev-сессии вручную открыть сотрудника по имени, изменить поля и сохранить; убедиться, что после возврата в таблицу отображаются новые значения.**
- [ ] **Step 3: Проверить удаление из страницы и из меню таблицы, неизвестный id и Avatar-заглушку с инициалами.**
- [ ] **Step 4: Проверить git diff на отсутствие изменений backend и лишних файлов.**
