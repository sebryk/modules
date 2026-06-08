import { Container } from '@mantine/core'

import { PagePlaceholder } from '@/shared/components/page-placeholder'

const Dashboard = () => {
   return (
      <Container px="md" fluid={true}>
         <PagePlaceholder
            title="Dashboard"
            description="Дашборд очищен перед переносом на Mantine. Здесь появятся новые виджеты и таблицы после стабилизации shell."
         />
      </Container>
   )
}

export { Dashboard }
