import { createResourceApi, createResourceHooks } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'
import type { Role, RoleForm } from '@/features/types'

export const rolesApi = createResourceApi<Role, RoleForm>(httpClient, '/api/roles/')

export const {
  useList: useRoles,
  useListPage: useRolesPage,
  useOne: useRole,
  useCreate: useCreateRole,
  useUpdate: useUpdateRole,
  useDelete: useDeleteRole,
} = createResourceHooks(['roles'], rolesApi, {
  entityLabel: 'Role',
  notify: {
    onCreated: (label) => toast.success(`${label} created.`),
    onUpdated: (label) => toast.success(`${label} updated.`),
    onDeleted: (label) => toast.success(`${label} deleted.`),
  },
})
