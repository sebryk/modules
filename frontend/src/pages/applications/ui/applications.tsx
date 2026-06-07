import { Container } from '@mantine/core'

import { PagePlaceholder } from '@/shared/components/page-placeholder'

const ApplicationsPage = () => {
   return (
      <Container fluid={true} px="md">
         <PagePlaceholder
            title="Заявки"
            description="Текущая таблица заявок временно снята. Следующим этапом здесь появится новая таблица на компонентах Mantine."
         />
      </Container>
   )
}

export { ApplicationsPage }
