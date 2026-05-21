import type { ComponentProps } from 'react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { setAccessToken } from '@/entities/session'
import { loginRequest } from '@/shared/api/auth'
import { ROUTES } from '@/shared/config/routes'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import data from '@/shared/data/login-page.json'

type RedirectState = {
   from?: {
      pathname?: string
   }
}

type SignInFormProps = {
   className?: string
}

const SignInForm = ({ className }: SignInFormProps) => {
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

         console.log(accessToken)

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
      <div className={cn('flex flex-col gap-6', className)}>
         <Card>
            <CardHeader>
               <CardTitle>{title}</CardTitle>
               <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit}>
                  <FieldGroup>
                     {inputs.map((input) => (
                        <Field key={input.name}>
                           <FieldLabel htmlFor={input.name}>{input.label}</FieldLabel>
                           <Input
                              id={input.name}
                              type={input.type}
                              placeholder={input.placeholder}
                              value={userAuth[input.name as keyof typeof userAuth] || ''}
                              onChange={(e) => {
                                 const value = e.target.value
                                 setUserAuth((prev) => ({
                                    ...prev,
                                    [input.name]: value,
                                 }))
                              }}
                           />
                        </Field>
                     ))}
                     {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
                     <Field>
                        <Button type="submit" disabled={isSubmitting}>
                           {isSubmitting ? 'Входим...' : button.title}
                        </Button>
                     </Field>
                  </FieldGroup>
               </form>
            </CardContent>
         </Card>
      </div>
   )
}

export { SignInForm }
