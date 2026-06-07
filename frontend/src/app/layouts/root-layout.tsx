import type { PropsWithChildren } from 'react'

import { BrowserRouter } from 'react-router'

import { ThemeProvider } from '@/shared/theme/provider'

const RootLayout = ({ children }: PropsWithChildren) => {
   return (
      <ThemeProvider>
         <BrowserRouter>{children}</BrowserRouter>
      </ThemeProvider>
   )
}

export { RootLayout }
