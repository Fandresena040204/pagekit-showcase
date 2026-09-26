import { useForm } from '@tanstack/react-form'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Main } from '@/components/layout/main'
import { RenderFormField } from '@/components/fields/render-form-field'
import type { CustomerForm } from '@/features/types'
import { useCreateCustomer, useCustomer, useUpdateCustomer } from './resource'
import {
  ADDRESS_FORM_FIELD,
  BIRTH_DATE_FORM_FIELD,
  CITY_FORM_FIELD,
  EMAIL_FORM_FIELD,
  NAME_FORM_FIELD,
  PHONE_FORM_FIELD,
} from './fields'

const emptyValues: CustomerForm = { name: '', email: '', phone: '', address: '', city: '', birth_date: '', is_active: true }

export function CustomersFormPage() {
  const { id } = useParams({ strict: false }) as { id?: string }
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: currentRow, isLoading } = useCustomer(id ?? '', { enabled: isEdit })
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()
  const isPending = createCustomer.isPending || updateCustomer.isPending

  const defaultValues: CustomerForm =
    isEdit && currentRow
      ? {
          name: currentRow.name,
          email: currentRow.email,
          phone: currentRow.phone,
          address: currentRow.address,
          city: currentRow.city,
          birth_date: currentRow.birth_date ?? '',
          is_active: currentRow.is_active,
        }
      : emptyValues

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const payload = { ...value, birth_date: value.birth_date || null } as unknown as CustomerForm
      if (isEdit && currentRow) {
        await updateCustomer.mutateAsync({ id: currentRow.id, payload })
      } else {
        await createCustomer.mutateAsync(payload)
      }
      navigate({ to: '/customers' })
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
        <h2 className='text-2xl font-bold tracking-tight'>{isEdit ? 'Edit Customer' : 'Add New Customer'}</h2>
        <p className='text-muted-foreground'>{isEdit ? 'Update the customer below.' : 'Create a new customer here.'}</p>
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
          <RenderFormField descriptor={PHONE_FORM_FIELD} form={form} />
          <RenderFormField descriptor={ADDRESS_FORM_FIELD} form={form} />
          <RenderFormField descriptor={CITY_FORM_FIELD} form={form} />
          <RenderFormField descriptor={BIRTH_DATE_FORM_FIELD} form={form} />

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
          <Button type='button' variant='outline' onClick={() => navigate({ to: '/customers' })}>
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
