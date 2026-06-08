import { Container } from '@mantine/core'

import { PagePlaceholder } from '@/shared/components/page-placeholder'

const ApplicationsPage = () => {
   return (
      <Container px="md" fluid={true}>
         <PagePlaceholder
            title="Заявки"
            description="Текущая таблица заявок временно снята. Следующим этапом здесь появится новая таблица на компонентах Mantine."
         />
      </Container>
   )
}

export { ApplicationsPage }
