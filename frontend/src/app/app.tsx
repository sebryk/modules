import { RootLayout } from '@/app/layouts/root-layout'
import { AppRouter } from '@/app/router'
import { useBootstrapSession } from '@/entities/session'

const App = () => {
   useBootstrapSession()

   return (
      <RootLayout>
         <AppRouter />
      </RootLayout>
   )
}

export default App
