import { RootLayout } from "@/app/layouts/root-layout"
import { AppRouter } from "@/app/router"

const App = () => {
   return (
      <RootLayout>
         <AppRouter />
      </RootLayout>
   )
}

export default App
