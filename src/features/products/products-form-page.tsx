import { ApiErrorState } from '@/components/errors/api-error-state'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useResourceForm } from 'tanstack-pagekit'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Main } from '@/components/layout/main'
import { RenderFormField } from '@/components/fields/render-form-field'
import type { Product, ProductForm } from '@/features/types'
import { useCreateProduct, useProduct, useUpdateProduct } from './resource'
import { CATEGORY_FORM_FIELD, DESCRIPTION_FORM_FIELD, NAME_FORM_FIELD, PRICE_FORM_FIELD, SKU_FORM_FIELD } from './fields'

const emptyValues: ProductForm = { name: '', sku: '', default_price: '0.00', category: '', description: '', is_active: true }

/**
 * Simple (non master/detail) form — `useResourceForm` (tanstack-pagekit)
 * handles isEdit/loading/notFound/create-vs-update/isPending; this page
 * only supplies the field mapping and the JSX (`RenderFormField` +
 * `FieldDescriptor`, same pattern as the Vente form's header fields).
 */
export function ProductsFormPage() {
  const { id } = useParams({ strict: false }) as { id?: string }
  const navigate = useNavigate()

  const { form, isEdit, isLoading, notFound, isPending } = useResourceForm<Product, ProductForm>({
    id,
    resource: { useOne: useProduct, useCreate: useCreateProduct, useUpdate: useUpdateProduct },
    emptyValues,
    toFormValues: (product) => ({
      name: product.name,
      sku: product.sku,
      default_price: product.default_price,
      category: product.category ?? '',
      description: product.description,
      is_active: product.is_active,
    }),
    onSuccess: () => navigate({ to: '/products' }),
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
        <h2 className='text-2xl font-bold tracking-tight'>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
        <p className='text-muted-foreground'>{isEdit ? 'Update the product below.' : 'Create a new product here.'}</p>
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
          <RenderFormField descriptor={SKU_FORM_FIELD} form={form} />
          <RenderFormField descriptor={PRICE_FORM_FIELD} form={form} />
          <RenderFormField descriptor={CATEGORY_FORM_FIELD} form={form} />
          <RenderFormField descriptor={DESCRIPTION_FORM_FIELD} form={form} />

          {/* `is_active` is a boolean — outside FieldDescriptor's type union
              (text/number/date/datetime/select), so it's a plain checkbox
              bound directly to `form.Field` rather than through
              RenderFormField. */}
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
          <Button type='button' variant='outline' onClick={() => navigate({ to: '/products' })}>
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
