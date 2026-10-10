import { createActionHook } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'
import { createCrudResource } from '@/lib/create-crud-resource'
import type { User } from '@/features/types'

// Django's UserViewSet is list/retrieve/create only (see
// apps/accounts/views/user_viewset.py) — no generic update/destroy, only
// the save actions below. `createCrudResource`'s useUpdate/useDelete are
// simply never destructured for this resource; `useCreateUser` below
// bypasses `createCrudResource`'s own `useCreate` because the payload
// shape (password, roles at creation) doesn't match `User`/a `TForm`.
export const {
  api: usersApi,
  useListPage: useUsersPage,
  useOne: useUser,
} = createCrudResource<User, never>('users', '/api/users/', 'User')

export type CreateUserPayload = {
  username: string
  email: string
  password: string
  roles: string[]
}

export const useCreateUser = createActionHook<CreateUserPayload>(
  ['users'],
  (payload) => httpClient.post('/api/users/', payload),
  () => toast.success('User created.')
)

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
