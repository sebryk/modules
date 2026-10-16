type EmployeeStatus = 'active' | 'invited' | 'vacation'

type EmployeePosition =
   | 'Инженер'
   | 'Диспетчер'
   | 'Менеджер'
   | 'Бухгалтер'
   | 'Руководитель'

type EmployeeRecord = {
   id: string
   email: string
   firstName: string
   lastName: string
   avatarUrl?: string
   position: EmployeePosition
   createdAt: string
   status: EmployeeStatus
}

const employeeStatusLabels: Record<EmployeeStatus, string> = {
   active: 'Активен',
   invited: 'Приглашён',
   vacation: 'В отпуске',
}

const employees: EmployeeRecord[] = [
   {
      id: '4c719f1a-a3f2-4eb9-8856-1f6f9ca2b0b5',
      email: 'i.petrov@company.dev',
      firstName: 'Иван',
      lastName: 'Петров',
      position: 'Руководитель',
      createdAt: '2026-01-12T10:00:00.000Z',
      status: 'active',
   },
   {
      id: '8d1cf4db-5d1a-4c34-9123-5b8c57c1a770',
      email: 'a.smirnova@company.dev',
      firstName: 'Анна',
      lastName: 'Смирнова',
      position: 'Бухгалтер',
      createdAt: '2026-02-04T10:00:00.000Z',
      status: 'active',
   },
   {
      id: '0f8c2b87-36d4-440d-b435-4b535f4f62c5',
      email: 'm.orlov@company.dev',
      firstName: 'Максим',
      lastName: 'Орлов',
      position: 'Менеджер',
      createdAt: '2026-02-18T10:00:00.000Z',
      status: 'vacation',
   },
   {
      id: '1b62a6d7-f536-4f30-92b4-b080ba7ac4c4',
      email: 'e.kuznetsova@company.dev',
      firstName: 'Елена',
      lastName: 'Кузнецова',
      position: 'Бухгалтер',
      createdAt: '2026-03-02T10:00:00.000Z',
      status: 'active',
   },
   {
      id: '7b8b0875-84ac-4d53-bf62-7905f5eab50d',
      email: 'd.volkov@company.dev',
      firstName: 'Дмитрий',
      lastName: 'Волков',
      position: 'Менеджер',
      createdAt: '2026-03-20T10:00:00.000Z',
      status: 'invited',
   },
   {
      id: 'd7ea297d-082e-43c3-b4dc-2d4873ef9ad9',
      email: 'k.ivanova@company.dev',
      firstName: 'Ксения',
      lastName: 'Иванова',
      position: 'Инженер',
      createdAt: '2026-04-08T10:00:00.000Z',
      status: 'active',
   },
   {
      id: 'b5b1f0f0-3c55-4ab0-9586-a0f3f94b3932',
      email: 'p.sokolov@company.dev',
      firstName: 'Павел',
      lastName: 'Соколов',
      position: 'Инженер',
      createdAt: '2026-04-14T10:00:00.000Z',
      status: 'active',
   },
   {
      id: '6f5fd428-3d87-4d4d-b542-c32240ef6c5e',
      email: 'o.lebedeva@company.dev',
      firstName: 'Ольга',
      lastName: 'Лебедева',
      position: 'Менеджер',
      createdAt: '2026-04-17T10:00:00.000Z',
      status: 'active',
   },
   {
      id: '8d795678-f84d-4b5f-a77b-2148e916fdd3',
      email: 's.romanov@company.dev',
      firstName: 'Сергей',
      lastName: 'Романов',
      position: 'Инженер',
      createdAt: '2026-04-22T10:00:00.000Z',
      status: 'vacation',
   },
   {
      id: 'e3d25b13-1c46-4f72-840b-063c0f695fe9',
      email: 'n.fedorova@company.dev',
      firstName: 'Наталья',
      lastName: 'Фёдорова',
      position: 'Диспетчер',
      createdAt: '2026-04-29T10:00:00.000Z',
      status: 'active',
   },
   {
      id: 'f1ccf1b7-0264-4d53-a5df-145c6e3759f8',
      email: 'a.kozlov@company.dev',
      firstName: 'Артём',
      lastName: 'Козлов',
      position: 'Инженер',
      createdAt: '2026-05-03T10:00:00.000Z',
      status: 'invited',
   },
   {
      id: '2fef42b4-b4c7-4f58-86d8-e3794133d398',
      email: 't.egorova@company.dev',
      firstName: 'Татьяна',
      lastName: 'Егорова',
      position: 'Бухгалтер',
      createdAt: '2026-05-06T10:00:00.000Z',
      status: 'active',
   },
   {
      id: '38552e56-83e6-49b3-b2c3-a659b481fdc1',
      email: 'v.novikov@company.dev',
      firstName: 'Виктор',
      lastName: 'Новиков',
      position: 'Менеджер',
      createdAt: '2026-05-10T10:00:00.000Z',
      status: 'active',
   },
   {
      id: '31b85fb1-a46d-4204-9e83-29d1c8ef6c8a',
      email: 'm.belyaeva@company.dev',
      firstName: 'Мария',
      lastName: 'Беляева',
      position: 'Диспетчер',
      createdAt: '2026-05-14T10:00:00.000Z',
      status: 'active',
   },
   {
      id: '709a65cb-f92d-474d-b2aa-7125d57eb15d',
      email: 'r.zaitsev@company.dev',
      firstName: 'Руслан',
      lastName: 'Зайцев',
      position: 'Инженер',
      createdAt: '2026-05-18T10:00:00.000Z',
      status: 'active',
   },
   {
      id: 'f04d87c2-fbe6-490b-a0c6-8e867401d4bb',
      email: 'y.morozova@company.dev',
      firstName: 'Юлия',
      lastName: 'Морозова',
      position: 'Менеджер',
      createdAt: '2026-05-21T10:00:00.000Z',
      status: 'vacation',
   },
   {
      id: 'c4a7d51c-72f4-4db0-a40f-d0b4f424cde0',
      email: 'g.pavlov@company.dev',
      firstName: 'Георгий',
      lastName: 'Павлов',
      position: 'Руководитель',
      createdAt: '2026-05-24T10:00:00.000Z',
      status: 'active',
   },
   {
      id: '17a535d2-7d8e-4206-ae29-44fc3af63b1e',
      email: 'l.tarasova@company.dev',
      firstName: 'Людмила',
      lastName: 'Тарасова',
      position: 'Диспетчер',
      createdAt: '2026-05-28T10:00:00.000Z',
      status: 'active',
   },
   {
      id: '7c7dc1cb-bb8a-4973-80c6-361c14535c66',
      email: 'i.melnik@company.dev',
      firstName: 'Игорь',
      lastName: 'Мельник',
      position: 'Инженер',
      createdAt: '2026-06-01T10:00:00.000Z',
      status: 'invited',
   },
   {
      id: 'b28688af-1172-4235-b653-90df73408f36',
      email: 'e.gromova@company.dev',
      firstName: 'Евгения',
      lastName: 'Громова',
      position: 'Менеджер',
      createdAt: '2026-06-03T10:00:00.000Z',
      status: 'active',
   },
   {
      id: 'c17f7a57-14b1-4eb7-a177-6d76dbb87e51',
      email: 'n.karpov@company.dev',
      firstName: 'Никита',
      lastName: 'Карпов',
      position: 'Инженер',
      createdAt: '2026-06-06T10:00:00.000Z',
      status: 'active',
   },
]

export { employees, employeeStatusLabels }
export type { EmployeeRecord, EmployeeStatus, EmployeePosition }
