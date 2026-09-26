import { createActionHook, createResourceApi, createResourceHooks } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'
import type { User } from '@/features/types'

// Django's UserViewSet is a ReadOnlyModelViewSet (see
// apps/accounts/views/user_viewset.py) — no create/update/delete, only
// list/retrieve plus the two custom actions below. `createResourceApi`'s
// create/update/delete are simply never called for this resource.
export const usersApi = createResourceApi<User, never>(httpClient, '/api/users/')

export const {
  useListPage: useUsersPage,
  useOne: useUser,
} = createResourceHooks(['users'], usersApi, { entityLabel: 'User' })

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
