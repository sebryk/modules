import { SignInForm } from "@/features/auth/sign-in"

const LoginPage = () => {
   return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 px-4 py-10">
         <h1 className="mx-auto w-full max-w-sm self-start font-heading text-2xl leading-snug font-medium">
            Система заявок
         </h1>
         <div className="w-full max-w-sm">
            <SignInForm />
         </div>
      </div>
   )
}

export { LoginPage }
