import { StrictMode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import '@/app/styles/index.css'
import App from '@/app/app.tsx'
import { queryClient } from '@/shared/api/query-client'

createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <QueryClientProvider client={queryClient}>
         <App />
      </QueryClientProvider>
   </StrictMode>,
)
