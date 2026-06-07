import { Container } from '@mantine/core'

import { PagePlaceholder } from '@/shared/components/page-placeholder'

const TeamPage = () => {
   return (
      <Container fluid={true} px="md">
         <PagePlaceholder
            title="Команда"
            description="Раздел команды будет собран заново на Mantine после завершения миграции shell и базовых экранов."
         />
      </Container>
   )
}

export { TeamPage }
