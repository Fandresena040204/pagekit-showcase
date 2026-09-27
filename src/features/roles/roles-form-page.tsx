import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useResourceForm, type FieldDescriptor } from 'tanstack-pagekit'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { RenderFormField } from '@/components/fields/render-form-field'
import type { Role, RoleForm } from '@/features/types'
import { useCreateRole, useRole, useUpdateRole } from './resource'
import { PermissionMatrix } from './permission-matrix'

const NAME_FORM_FIELD: FieldDescriptor<RoleForm> = { name: 'name', label: 'Name', type: 'text' }

const emptyValues: RoleForm = { name: '', permissions: [] }

export function RolesFormPage() {
  const { id } = useParams({ strict: false }) as { id?: string }
  const navigate = useNavigate()

  const { form, isEdit, isLoading, notFound, isPending } = useResourceForm<Role, RoleForm>({
    id,
    resource: { useOne: useRole, useCreate: useCreateRole, useUpdate: useUpdateRole },
    emptyValues,
    toFormValues: (role) => ({ name: role.name, permissions: role.permissions }),
    onSuccess: () => navigate({ to: '/roles' }),
  })

  if (isLoading) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <Loader2 className='animate-spin' />
      </Main>
    )
  }

  if (notFound) {
    return (
      <Main>
        <p className='text-destructive'>Role not found.</p>
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
        className='w-full space-y-4'
      >
        <div className='rounded-md border p-4 sm:max-w-sm'>
          <RenderFormField descriptor={NAME_FORM_FIELD} form={form} />
        </div>

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
