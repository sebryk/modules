import { useState } from "react"
import { useLocation, useNavigate } from "react-router"

import { writeSession } from "@/entities/session"
import { cn } from "@/shared/lib/utils"
import { ROUTES } from "@/shared/config/routes"
import { Button } from "@/shared/ui/button"
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/shared/ui/card"
import {
   Field,
   FieldDescription,
   FieldError,
   FieldGroup,
   FieldLabel,
} from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import data from "@/shared/data/login-page.json"

type RedirectState = {
   from?: {
      pathname?: string
   }
}

type SignInFormProps = {
   className?: string
}

const SignInForm = ({ className }: SignInFormProps) => {
   const { form: { title, subtitle, inputs, submitButton } } = data
   const navigate = useNavigate()
   const location = useLocation()
   const state = location.state as RedirectState | null
   const [login, setLogin] = useState("")
   const [password, setPassword] = useState("")
   const [errorMessage, setErrorMessage] = useState<string | null>(null)

   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const normalizedLogin = login.trim()

      if (!normalizedLogin || !password) {
         setErrorMessage("Enter login and password.")
         return
      }

      writeSession({
         login: normalizedLogin,
         password,
      })

      const nextPath = state?.from?.pathname ?? ROUTES.dashboard
      navigate(nextPath, { replace: true })
   }

   return (
      <div className={cn("flex flex-col gap-6", className)}>
         <Card>
            <CardHeader>
               <CardTitle>{title}</CardTitle>
               <CardDescription>
                 {subtitle}
               </CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit}>
                  <FieldGroup>
                     <Field>
                        <FieldLabel htmlFor="login">{inputs.login.label}</FieldLabel>
                        <Input
                           id="login"
                           type="text"
                           placeholder={inputs.login.placeholder}
                           value={login}
                           onChange={(event) => {
                              setLogin(event.target.value)
                              setErrorMessage(null)
                           }}
                           required
                        />
                     </Field>
                     <Field>
                        <FieldLabel htmlFor="password">{inputs.password.label}</FieldLabel>
                        <Input
                           id="password"
                           type="password"
                           placeholder={inputs.password.placeholder}
                           value={password}
                           onChange={(event) => {
                              setPassword(event.target.value)
                              setErrorMessage(null)
                           }}
                           required
                        />
                     </Field>
                     {errorMessage ? (
                        <FieldError>{errorMessage}</FieldError>
                     ) : null}
                     <Field>
                        <Button type="submit">{submitButton}</Button>
                     </Field>
                  </FieldGroup>
               </form>
            </CardContent>
         </Card>
      </div>
   )
}

export { SignInForm }
