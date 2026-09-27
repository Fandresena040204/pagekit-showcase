import { createCrudResource } from '@/lib/create-crud-resource'
import type { Role, RoleForm } from '@/features/types'

export const {
  api: rolesApi,
  useList: useRoles,
  useListPage: useRolesPage,
  useOne: useRole,
  useCreate: useCreateRole,
  useUpdate: useUpdateRole,
  useDelete: useDeleteRole,
} = createCrudResource<Role, RoleForm>('roles', '/api/roles/', 'Role')
