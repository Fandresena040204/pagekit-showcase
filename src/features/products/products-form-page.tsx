import { useForm } from '@tanstack/react-form'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Main } from '@/components/layout/main'
import { RenderFormField } from '@/components/fields/render-form-field'
import type { ProductForm } from '@/features/types'
import { useCreateProduct, useProduct, useUpdateProduct } from './resource'
import { CATEGORY_FORM_FIELD, DESCRIPTION_FORM_FIELD, NAME_FORM_FIELD, PRICE_FORM_FIELD, SKU_FORM_FIELD } from './fields'

const emptyValues: ProductForm = { name: '', sku: '', default_price: '0.00', category: '', description: '', is_active: true }

/**
 * Simple (non master/detail) form — plain TanStack Form `useForm` rather
 * than `useMasterDetailForm` (no line array here), same `RenderFormField` +
 * `FieldDescriptor` pattern as the Vente form's header fields.
 */
export function ProductsFormPage() {
  const { id } = useParams({ strict: false }) as { id?: string }
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: currentRow, isLoading } = useProduct(id ?? '', { enabled: isEdit })
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const isPending = createProduct.isPending || updateProduct.isPending

  const defaultValues: ProductForm =
    isEdit && currentRow
      ? {
          name: currentRow.name,
          sku: currentRow.sku,
          default_price: currentRow.default_price,
          category: currentRow.category ?? '',
          description: currentRow.description,
          is_active: currentRow.is_active,
        }
      : emptyValues

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (isEdit && currentRow) {
        await updateProduct.mutateAsync({ id: currentRow.id, payload: value })
      } else {
        await createProduct.mutateAsync(value)
      }
      navigate({ to: '/products' })
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
