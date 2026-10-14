import { MutationCache, QueryCache, QueryClient, type QueryKey } from '@tanstack/react-query'
import { isRetryableApiError, parseApiError } from 'tanstack-pagekit/axios'
import { toast } from '@/lib/toast'
import { refreshCurrentUser } from '@/features/auth/api'
import { invalidateAfterWorkflow } from './cache-rules'

/** Shared reactions to the API's error codes, for queries and mutations alike. */
function reactToError(error: unknown, queryKey?: QueryKey) {
  switch (parseApiError(error).code) {
    case 'invalid_transition':
      // The entity moved on (someone else played a step): show its real state.
      invalidateAfterWorkflow(queryClient)
      break
    case 'permission_denied':
      // Roles may have changed since sign-in: reload the user's permissions.
      refreshCurrentUser()
      break
    case 'not_found':
      if (queryKey) queryClient.removeQueries({ queryKey })
      break
  }
}

export const queryClient: QueryClient = new QueryClient({
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
  queryCache: new QueryCache({
    onError: (error, query) => reactToError(error, query.queryKey),
  }),
  // Every failed mutation says why (a refused workflow step used to fail
  // silently). Form field errors are shown under the fields on top of this.
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(parseApiError(error).message)
      reactToError(error)
    },
  }),
})
