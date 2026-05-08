import { SignInForm } from "@/features/auth/sign-in"

const LoginPage = () => {
   return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
         <div className="w-full max-w-sm">
            <SignInForm />
         </div>
      </div>
   )
}

export { LoginPage }
