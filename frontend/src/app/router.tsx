import { Route, Routes } from "react-router"

import { ProtectedRoute } from "@/app/guards/protected-route"
import { PublicOnlyRoute } from "@/app/guards/public-only-route"
import { RootLayout } from "@/widgets/app-layout"
import { ApplicationsPage } from "@/pages/applications"
import { HomePage } from "@/pages/home"
import { LoginPage } from "@/pages/login"
import { TeamPage } from "@/pages/team"
import { ROUTES } from "@/shared/config/routes"

const AppRouter = () => {
   return (
      <Routes>
         <Route
            path={ROUTES.login}
            element={
               <PublicOnlyRoute>
                  <LoginPage />
               </PublicOnlyRoute>
            }
         />
         <Route
            element={
               <ProtectedRoute>
                  <RootLayout />
               </ProtectedRoute>
            }
         >
            <Route index element={<HomePage />} />
            <Route path={ROUTES.applications} element={<ApplicationsPage />} />
            <Route path={ROUTES.team} element={<TeamPage />} />
         </Route>
      </Routes>
   )
}

export { AppRouter }
