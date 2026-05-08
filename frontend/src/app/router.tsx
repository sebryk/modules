import { Route, Routes } from "react-router"

import { RootLayout } from "@/widgets/app-layout"
import { ApplicationsPage } from "@/pages/applications"
import { HomePage } from "@/pages/home"
import { TeamPage } from "@/pages/team"
import { ROUTES } from "@/shared/config/routes"

const AppRouter = () => {
   return (
      <Routes>
         <Route element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path={ROUTES.applications} element={<ApplicationsPage />} />
            <Route path={ROUTES.team} element={<TeamPage />} />
         </Route>
      </Routes>
   )
}

export { AppRouter }
