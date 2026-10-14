import type { QueryClient } from '@tanstack/react-query'

// Query key convention: the root of every key is the API resource name
// (`['ventes', ...]`, `['livraisons', ...]`, `['audit-logs', ...]`,
// `['permissions']`, `['roles', ...]`...) — the rules below rely on it.

/** Catalogs a workflow step never changes: not worth refetching after one. */
export const STABLE_CATALOGS = ['roles', 'permissions', 'parametres']

/**
 * A workflow step can have effects anywhere on the backend (validating DG
 * creates a livraison) — rather than mirroring the backend's effect list
 * here, which would drift, every business query is invalidated. Only the
 * queries on screen actually refetch; the others are just marked stale.
 */
export function invalidateAfterWorkflow(client: QueryClient) {
  return client.invalidateQueries({
    predicate: (query) => !STABLE_CATALOGS.includes(String(query.queryKey[0])),
  })
}
