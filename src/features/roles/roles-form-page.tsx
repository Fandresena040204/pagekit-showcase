import { useForm } from '@tanstack/react-form'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { RenderFormField } from '@/components/fields/render-form-field'
import { type FieldDescriptor } from 'tanstack-pagekit'
import type { Role, RoleForm } from '@/features/types'
import { useCreateRole, useRole, useUpdateRole } from './resource'
import { PermissionMatrix } from './permission-matrix'

const NAME_FORM_FIELD: FieldDescriptor<RoleForm> = { name: 'name', label: 'Name', type: 'text' }

const emptyValues: RoleForm = { name: '', permissions: [] }

export function RolesFormPage() {
  const { id } = useParams({ strict: false }) as { id?: string }
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: currentRow, isLoading } = useRole(id ?? '', { enabled: isEdit })
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const isPending = createRole.isPending || updateRole.isPending

  const defaultValues: RoleForm =
    isEdit && currentRow ? { name: currentRow.name, permissions: currentRow.permissions } : emptyValues

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (isEdit && currentRow) {
        await updateRole.mutateAsync({ id: currentRow.id, payload: value })
      } else {
        await createRole.mutateAsync(value)
      }
      navigate({ to: '/roles' })
    },
  })

  if (isEdit && isLoading) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <Loader2 className='animate-spin' />
      </Main>
    )
  }

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>{isEdit ? 'Edit Role' : 'Add New Role'}</h2>
        <p className='text-muted-foreground'>
          {isEdit ? 'Update the role and its permissions below.' : 'Create a new role and grant it permissions.'}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className='max-w-2xl space-y-4'
      >
        <RenderFormField descriptor={NAME_FORM_FIELD} form={form} />

        <form.Field name='permissions'>
          {(field: { state: { value: Role['permissions'] }; handleChange: (v: string[]) => void }) => (
            <PermissionMatrix value={field.state.value} onChange={field.handleChange} />
          )}
        </form.Field>

        <div className='flex justify-end gap-2 pt-2'>
          <Button type='button' variant='outline' onClick={() => navigate({ to: '/roles' })}>
            Cancel
          </Button>
          <Button type='submit' disabled={isPending}>
            {isPending && <Loader2 className='animate-spin' />}
            Save changes
          </Button>
        </div>
      </form>
    </Main>
  )
}
