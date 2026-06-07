import { Container, Stack, Title } from '@mantine/core'

import { SignInForm } from '@/features/auth/sign-in'
import data from '@/shared/data/login-page.json'

const LoginPage = () => {
   return (
      <Container py="xl" size={460}>
         <Stack gap="md" mih="100dvh" justify="center">
            <Title order={2} ta="center">
               {data.title}
            </Title>
            <SignInForm />
         </Stack>
      </Container>
   )
}

export { LoginPage }
