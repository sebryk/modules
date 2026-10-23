import { Button, Container, Paper, Stack, Text, Title } from '@mantine/core'
import { ArrowLeftIcon } from 'lucide-react'
import { Link } from 'react-router'

import { ROUTES } from '@/shared/config/routes'
import { EMPLOYEE_PAGE_CONTENT } from '@/shared/data/employee-page'

const EmployeeNotFound = () => {
   const { title, description, backToEmployees } = EMPLOYEE_PAGE_CONTENT.notFound

   return (
      <Container py="xl" fluid={true} bg="var(--mantine-color-dark-8)">
         <Paper p="xl" radius="lg" withBorder={true}>
            <Stack gap="sm" align="center">
               <Title order={2}>{title}</Title>
               <Text c="dimmed">{description}</Text>
               <Button
                  component={Link}
                  to={ROUTES.team}
                  leftSection={<ArrowLeftIcon size={16} />}
               >
                  {backToEmployees}
               </Button>
            </Stack>
         </Paper>
      </Container>
   )
}

export { EmployeeNotFound }
