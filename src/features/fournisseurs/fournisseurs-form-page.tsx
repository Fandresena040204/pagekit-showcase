import { ApiErrorState } from '@/components/errors/api-error-state'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useResourceForm } from 'tanstack-pagekit'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Main } from '@/components/layout/main'
import { RenderFormField } from '@/components/fields/render-form-field'
import type { Fournisseur, FournisseurForm } from '@/features/types'
import { useCreateFournisseur, useFournisseur, useUpdateFournisseur } from './resource'
import { EMAIL_FORM_FIELD, NAME_FORM_FIELD } from './fields'

const emptyValues: FournisseurForm = { name: '', email: '', is_active: true }

export function FournisseursFormPage() {
  const { id } = useParams({ strict: false }) as { id?: string }
  const navigate = useNavigate()

  const { form, isEdit, isLoading, notFound, isPending } = useResourceForm<Fournisseur, FournisseurForm>({
    id,
    resource: { useOne: useFournisseur, useCreate: useCreateFournisseur, useUpdate: useUpdateFournisseur },
    emptyValues,
    toFormValues: (fournisseur) => ({
      name: fournisseur.name,
      email: fournisseur.email,
      is_active: fournisseur.is_active,
    }),
    onSuccess: () => navigate({ to: '/fournisseurs' }),
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
        <ApiErrorState />
      </Main>
    )
  }

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>{isEdit ? 'Edit Fournisseur' : 'Add New Fournisseur'}</h2>
        <p className='text-muted-foreground'>{isEdit ? 'Update the fournisseur below.' : 'Create a new fournisseur here.'}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className='w-full space-y-4'
      >
        <div className='grid grid-cols-1 gap-4 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-3'>
          <RenderFormField descriptor={NAME_FORM_FIELD} form={form} />
          <RenderFormField descriptor={EMAIL_FORM_FIELD} form={form} />

          <form.Field name='is_active'>
            {(field) => (
              <div className='flex items-center gap-2 self-end pb-2'>
                <Checkbox
                  id='is_active'
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked === true)}
                />
                <Label htmlFor='is_active'>Active</Label>
              </div>
            )}
          </form.Field>
        </div>

        <div className='flex justify-end gap-2 pt-2'>
          <Button type='button' variant='outline' onClick={() => navigate({ to: '/fournisseurs' })}>
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
