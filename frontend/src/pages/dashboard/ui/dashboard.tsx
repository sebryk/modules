import { Container } from '@mantine/core'

import { PagePlaceholder } from '@/shared/components/page-placeholder'

const Dashboard = () => {
   return (
      <Container fluid={true} px="md">
         <PagePlaceholder
            title="Dashboard"
            description="Дашборд очищен перед переносом на Mantine. Здесь появятся новые виджеты и таблицы после стабилизации shell."
         />
      </Container>
   )
}

export { Dashboard }
