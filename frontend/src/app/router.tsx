import { Route, Routes } from 'react-router'

import { ProtectedRoute } from '@/app/guards/protected-route'
import { PublicRoute } from '@/app/guards/public-route'
import { RootLayout } from '@/widgets/app-layout'
import { ApplicationsPage } from '@/pages/applications'
import { Dashboard } from '@/pages/dashboard'
import { LoginPage } from '@/pages/login'
import { TeamPage } from '@/pages/team'
import { ROUTES } from '@/shared/config/routes'

const AppRouter = () => {
   return (
      <Routes>
         <Route
            path={ROUTES.login}
            element={
               <PublicRoute>
                  <LoginPage />
               </PublicRoute>
            }
         />
         <Route
            element={
               <ProtectedRoute>
                  <RootLayout />
               </ProtectedRoute>
            }
         >
            <Route index element={<Dashboard />} />
            <Route path={ROUTES.applications} element={<ApplicationsPage />} />
            <Route path={ROUTES.team} element={<TeamPage />} />
         </Route>
      </Routes>
   )
}

export { AppRouter }
