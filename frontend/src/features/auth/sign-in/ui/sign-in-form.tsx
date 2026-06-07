import type { RedirectState } from '@/shared/types/router'

import { type ComponentProps, useState } from 'react'

import { Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { useLocation, useNavigate } from 'react-router'

import { setAccessToken } from '@/entities/session'
import { loginRequest } from '@/shared/api/auth'
import { ROUTES } from '@/shared/config/routes'
import data from '@/shared/data/login-page.json'

const SignInForm = () => {
   const {
      form: { title, subtitle, inputs, button },
   } = data
   const navigate = useNavigate()
   const location = useLocation()
   const state = location.state as RedirectState | null
   const [userAuth, setUserAuth] = useState({
      login: 'admin@example.com',
      password: 'ChangeMe123!',
   })
   const { login, password } = userAuth
   const [errorMessage, setErrorMessage] = useState<string | null>(null)
   const [isSubmitting, setIsSubmitting] = useState(false)

   const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = async (event) => {
      event.preventDefault()

      const normalizedLogin = login.trim()

      if (!normalizedLogin || !password) {
         setErrorMessage('Введите логин и пароль.')
         return
      }

      setIsSubmitting(true)
      setErrorMessage(null)

      try {
         const accessToken = await loginRequest({
            email: normalizedLogin,
            password,
         })

         setAccessToken(accessToken)

         const nextPath = state?.from?.pathname ?? ROUTES.dashboard
         navigate(nextPath, { replace: true })
      } catch (error) {
         setErrorMessage(error instanceof Error ? error.message : 'Не удалось выполнить вход.')
      } finally {
         setIsSubmitting(false)
      }
   }

   return (
      <Paper p="xl" radius="lg" shadow="sm" withBorder={true}>
         <Stack gap="lg">
            <Stack gap={4}>
               <Title order={2}>{title}</Title>
               <Text size="sm" c="dimmed">
                  {subtitle}
               </Text>
            </Stack>

            <form onSubmit={handleSubmit}>
               <Stack gap="md">
                  {inputs.map((input) =>
                     input.type === 'password' ? (
                        <PasswordInput
                           id={input.name}
                           key={input.name}
                           label={input.label}
                           placeholder={input.placeholder}
                           value={userAuth[input.name as keyof typeof userAuth] || ''}
                           onChange={(event) => {
                              const { value } = event.currentTarget
                              setUserAuth((prev) => ({
                                 ...prev,
                                 [input.name]: value,
                              }))
                           }}
                        />
                     ) : (
                        <TextInput
                           id={input.name}
                           key={input.name}
                           type={input.type}
                           label={input.label}
                           placeholder={input.placeholder}
                           value={userAuth[input.name as keyof typeof userAuth] || ''}
                           onChange={(event) => {
                              const { value } = event.currentTarget
                              setUserAuth((prev) => ({
                                 ...prev,
                                 [input.name]: value,
                              }))
                           }}
                        />
                     ),
                  )}

                  {errorMessage ? (
                     <Text c="red" size="sm">
                        {errorMessage}
                     </Text>
                  ) : null}

                  <Button
                     mt={40}
                     type="submit"
                     fullWidth={true}
                     loading={isSubmitting}
                     loaderProps={{ type: 'dots' }}
                  >
                     {isSubmitting ? 'Входим...' : button.title}
                  </Button>
               </Stack>
            </form>
         </Stack>
      </Paper>
   )
}

export { SignInForm }
