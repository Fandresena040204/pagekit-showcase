import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { PagekitProvider, type PagekitConfig } from 'tanstack-pagekit'
import { ThemeProvider } from '@/context/theme-provider'
import { router } from './router'
import { queryClient } from '@/lib/query-client'
import { expireSession } from '@/lib/session'
import { onSessionExpired } from '@/lib/api-client'
import { parseApiError } from 'tanstack-pagekit/axios'
import './styles/index.css'

// Refresh refused → back to sign-in, then to this page (see `session.ts`).
onSessionExpired(() => expireSession(router))

// Every resource-backed form shows the API's per-field errors (`champs`)
// under the matching fields — set once here, not on each page.
const pagekitConfig: PagekitConfig = {
  serverErrors: (error) => parseApiError(error).champs,
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <PagekitProvider config={pagekitConfig}>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </PagekitProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
