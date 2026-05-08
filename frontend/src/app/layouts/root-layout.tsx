import type { PropsWithChildren } from "react"
import { BrowserRouter } from "react-router"

import { ThemeProvider } from "@/shared/ui/theme-provider"
import { TooltipProvider } from "@/shared/ui/tooltip"

const RootLayout = ({ children }: PropsWithChildren) => {
   return (
      <ThemeProvider>
         <TooltipProvider>
            <BrowserRouter>
               {children}
            </BrowserRouter>
         </TooltipProvider>
      </ThemeProvider>
   )
}

export { RootLayout }
