import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { PagekitProvider, type PagekitConfig } from 'tanstack-pagekit'
import { ThemeProvider } from '@/context/theme-provider'
import { router } from './router'
import { isRetryableApiError, parseApiError } from 'tanstack-pagekit/axios'
import { toast } from '@/lib/toast'
import './styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000,
      refetchOnWindowFocus: false,
      // Failed queries render through the router's error boundary (403/404/5xx
      // screens) instead of a bare "Failed to load" line.
      throwOnError: true,
      retry: (failureCount, error) => isRetryableApiError(error) && failureCount < 2,
    },
  },
  // Every failed mutation says why (a refused workflow step used to fail
  // silently). Form field errors are shown under the fields on top of this.
  mutationCache: new MutationCache({
    onError: (error) => toast.error(parseApiError(error).message),
  }),
})

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
