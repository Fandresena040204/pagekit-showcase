import { createActionHook } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'
import { createCrudResource } from '@/lib/create-crud-resource'
import type { User } from '@/features/types'

// Django's UserViewSet is a ReadOnlyModelViewSet (see
// apps/accounts/views/user_viewset.py) — no create/update/delete, only
// list/retrieve plus the two custom actions below. `createCrudResource`'s
// useCreate/useUpdate/useDelete are simply never destructured for this
// resource.
export const {
  api: usersApi,
  useListPage: useUsersPage,
  useOne: useUser,
} = createCrudResource<User, never>('users', '/api/users/', 'User')

export const useAssignRole = createActionHook<{ id: string; role: string }>(
  ['users'],
  ({ id, role }) => httpClient.post(`/api/users/${id}/assign_role/`, { role }),
  () => toast.success('Role assigned.')
)

export const useRemoveRole = createActionHook<{ id: string; role: string }>(
  ['users'],
  ({ id, role }) => httpClient.post(`/api/users/${id}/remove_role/`, { role }),
  () => toast.success('Role removed.')
)
