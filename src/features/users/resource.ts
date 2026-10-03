import { createActionHook } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'
import { createCrudResource } from '@/lib/create-crud-resource'
import type { User } from '@/features/types'

// Django's UserViewSet is a ReadOnlyModelViewSet (see
// apps/accounts/views/user_viewset.py) — no create/update/delete, only
// list/retrieve plus the save actions below. `createCrudResource`'s
// useCreate/useUpdate/useDelete are simply never destructured for this
// resource.
export const {
  api: usersApi,
  useListPage: useUsersPage,
  useOne: useUser,
} = createCrudResource<User, never>('users', '/api/users/', 'User')

export const useSetUserRoles = createActionHook<{ id: string; roles: string[] }>(
  ['users'],
  ({ id, roles }) => httpClient.post(`/api/users/${id}/set_roles/`, { roles }),
  () => toast.success('Roles saved.')
)

export const useSetPermissionOverrides = createActionHook<{
  id: string
  overrides: { permission: string; is_allowed: boolean }[]
}>(
  ['users'],
  ({ id, overrides }) => httpClient.post(`/api/users/${id}/set_permission_overrides/`, { overrides }),
  () => toast.success('Permissions saved.')
)
