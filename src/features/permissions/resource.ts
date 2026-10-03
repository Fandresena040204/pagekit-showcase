import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/lib/http-client'
import type { PermissionGroup } from '@/features/types'

/**
 * Backed by apps/core/views.py's PermissionsMetaView (/api/permissions/):
 * every Permission row the backend's create_custom_permissions signal has
 * ever generated, grouped by (app_label, model). Single source of truth for
 * both permission-matrix.tsx (roles) and permission-override-matrix.tsx
 * (users) — a new entity shows up in both matrices automatically once its
 * migration runs, no hardcoded model list to maintain on either side.
 */
export function usePermissionsList() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => (await httpClient.get<PermissionGroup[]>('/api/permissions/')).data,
    staleTime: 5 * 60 * 1000,
  })
}

export const ACTIONS = ['view', 'add', 'change', 'delete'] as const

/** Case-insensitive substring match on the model label, applied in memory (no request per keystroke). */
export function filterPermissionGroups(groups: PermissionGroup[], search: string): PermissionGroup[] {
  const needle = search.trim().toLowerCase()
  if (!needle) return groups
  return groups.filter((g) => g.model.toLowerCase().includes(needle))
}

export function groupByApp(groups: PermissionGroup[]): Map<string, PermissionGroup[]> {
  const byApp = new Map<string, PermissionGroup[]>()
  for (const g of groups) {
    const list = byApp.get(g.app_label) ?? []
    list.push(g)
    byApp.set(g.app_label, list)
  }
  return byApp
}
