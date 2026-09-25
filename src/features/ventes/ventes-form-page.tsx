import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useMasterDetailForm } from 'tanstack-pagekit'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Main } from '@/components/layout/main'
import { RenderFormField } from '@/components/fields/render-form-field'
import type { VenteForm, VenteLineForm } from '@/features/types'
import { useCreateVente, useUpdateVente, useVente } from './resource'
import { CUSTOMER_FORM_FIELD, lineFormFields } from './fields'

const emptyLine: VenteLineForm = { product: '', quantity: '1', unit_price: '0.00' }

/**
 * Master/detail form on top of TanStack Form (`useMasterDetailForm`):
 * `customer` is a server-search autocomplete, each line's `product` is
 * another autocomplete whose selection cascades into `unit_price`
 * (`fillsFields`) — same mechanics as poc-vente-front's `ventes-form.tsx`
 * (react-hook-form + `useFieldArray`), rebuilt on TanStack Form's own array
 * field helpers.
 */
export function VentesFormPage() {
  const { id } = useParams({ strict: false }) as { id?: string }
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: currentRow, isLoading } = useVente(id ?? '', { enabled: isEdit })
  const createVente = useCreateVente()
  const updateVente = useUpdateVente()
  const isPending = createVente.isPending || updateVente.isPending

  const defaultValues: VenteForm =
    isEdit && currentRow
      ? {
          customer: currentRow.customer,
          lines: currentRow.lines.map((l) => ({ id: l.id, product: l.product, quantity: l.quantity, unit_price: l.unit_price })),
        }
      : { customer: '', lines: [emptyLine] }

  const { form, addLine, removeLine } = useMasterDetailForm<Omit<VenteForm, 'lines'>, VenteLineForm, 'lines'>({
    defaultValues,
    linesFieldName: 'lines',
    defaultLine: emptyLine,
    onSubmit: async (values) => {
      if (isEdit && currentRow) {
        await updateVente.mutateAsync({ id: currentRow.id, payload: values as VenteForm })
      } else {
        await createVente.mutateAsync(values as VenteForm)
      }
      navigate({ to: '/ventes' })
    },
  })

  if (isEdit && isLoading) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <Loader2 className='animate-spin' />
      </Main>
    )
  }

  if (isEdit && !currentRow) {
    return (
      <Main>
        <p className='text-destructive'>Vente not found.</p>
      </Main>
    )
  }

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>{isEdit ? 'Edit Vente' : 'Add New Vente'}</h2>
        <p className='text-muted-foreground'>
          {isEdit ? 'Update the vente information below.' : 'Create a new vente here.'}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className='max-w-2xl space-y-4'
      >
        <RenderFormField descriptor={CUSTOMER_FORM_FIELD} form={form} />

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label>Lines</Label>
            <Button type='button' variant='outline' size='sm' onClick={addLine}>
              <Plus size={14} /> Add line
            </Button>
          </div>

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <form.Field name='lines' mode='array'>
            {(linesField: any) =>
              linesField.state.value.map((_: VenteLineForm, index: number) => {
                const [productField, quantityField, unitPriceField] = lineFormFields(index)
                return (
                  <div key={index} className='grid grid-cols-12 items-start gap-2 rounded-md border p-2'>
                    <RenderFormField descriptor={productField} form={form} hideLabel className='col-span-5' />
                    <RenderFormField descriptor={quantityField} form={form} hideLabel className='col-span-3' />
                    <RenderFormField descriptor={unitPriceField} form={form} hideLabel className='col-span-3' />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='col-span-1'
                      disabled={linesField.state.value.length === 1}
                      onClick={() => removeLine(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )
              })
            }
          </form.Field>
        </div>

        <div className='flex justify-end gap-2 pt-2'>
          <Button type='button' variant='outline' onClick={() => navigate({ to: '/ventes' })}>
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
