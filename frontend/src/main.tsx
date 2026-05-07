import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { TooltipProvider } from "@/components/ui/tooltip.tsx"
import { BrowserRouter } from "react-router"

createRoot(document.getElementById("root")!).render(
   <StrictMode>
      <ThemeProvider>
         <TooltipProvider>
            <BrowserRouter>
               <App />
            </BrowserRouter>
         </TooltipProvider>
      </ThemeProvider>
   </StrictMode>
)
