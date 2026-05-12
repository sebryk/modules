import { SignInForm } from "@/features/auth/sign-in"

const LoginPage = () => {
   return (
      <div className="flex min-h-screen items-center flex-col justify-center bg-muted/30 gap-4 px-4 py-10">
         <h1 className="font-heading leading-snug font-medium text-2xl self-start max-w-sm w-full mx-auto">Система заявок</h1>
         <div className="w-full max-w-sm">
            <SignInForm />
         </div>
      </div>
   )
}

export { LoginPage }
