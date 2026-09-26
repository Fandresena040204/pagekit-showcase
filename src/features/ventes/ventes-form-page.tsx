import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useMasterDetailForm } from 'tanstack-pagekit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { RenderFormField } from '@/components/fields/render-form-field'
import type { VenteForm, VenteLineForm } from '@/features/types'
import { computeVenteBreakdown } from './totals'
import { useCreateVente, useUpdateVente, useVente } from './resource'
import {
  CUSTOMER_FORM_FIELD,
  DATE_FORM_FIELD,
  CURRENCY_FORM_FIELD,
  GLOBAL_DISCOUNT_FORM_FIELD,
  lineFormFields,
} from './fields'

const emptyLine: VenteLineForm = {
  product: '',
  quantity: '1',
  unit_price: '0.00',
  discount_percent: '0',
  tva_rate: '20',
}

const emptyValues: VenteForm = {
  customer: '',
  currency: 'MGA',
  discount_percent: '0',
  expected_delivery_date: '',
  lines: [emptyLine],
}

/**
 * "NOUVELLE FACTURE" — reproduces the mockup from the lib's conception docs
 * (Concetion_moteur/lib-page-builder/05-page-formulaire.md /
 * saisie-saisiemultiple.md) as closely as the shadcn/ui primitives allow:
 * header fields (Client/Date/Devise/Remise globale), a LIGNES table
 * (Produit/Qté/P.U./Remise/TVA + delete), then a right-aligned totals
 * footer (Total HT / Remise globale / TVA / TOTAL) computed live client-side
 * via `computeVenteBreakdown` — same formula as the backend's
 * `Vente.recalculate_total`, so the preview matches what the server returns
 * on save.
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
          currency: currentRow.currency,
          discount_percent: currentRow.discount_percent,
          expected_delivery_date: currentRow.expected_delivery_date ?? '',
          lines: currentRow.lines.map((l) => ({
            id: l.id,
            product: l.product,
            quantity: l.quantity,
            unit_price: l.unit_price,
            discount_percent: l.discount_percent,
            tva_rate: l.tva_rate,
          })),
        }
      : emptyValues

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
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <Card className='mx-auto max-w-3xl'>
          <CardHeader className='border-b pb-4 text-center'>
            <CardTitle className='text-lg tracking-wide'>
              {isEdit ? 'MODIFIER LA FACTURE' : 'NOUVELLE FACTURE'}
            </CardTitle>
          </CardHeader>

          <CardContent className='space-y-6 pt-6'>
            {/* --- Header: Client / Date / Devise / Remise globale --- */}
            <div className='grid grid-cols-1 gap-4 border-b pb-6 sm:grid-cols-2'>
              <RenderFormField descriptor={CUSTOMER_FORM_FIELD} form={form} />
              <RenderFormField descriptor={DATE_FORM_FIELD} form={form} />
              <RenderFormField descriptor={CURRENCY_FORM_FIELD} form={form} />
              <RenderFormField descriptor={GLOBAL_DISCOUNT_FORM_FIELD} form={form} />
            </div>

            {/* --- LIGNES --- */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold tracking-wide'>LIGNES</h3>
              </div>

              <div className='hidden grid-cols-[1fr_80px_100px_90px_80px_40px] gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid'>
                <span>Produit</span>
                <span>Qté</span>
                <span>P.U.</span>
                <span>Remise</span>
                <span>TVA</span>
                <span />
              </div>

              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <form.Field name='lines' mode='array'>
                {(linesField: any) =>
                  linesField.state.value.map((_: VenteLineForm, index: number) => {
                    const [productField, quantityField, unitPriceField, discountField, tvaField] =
                      lineFormFields(index)
                    return (
                      <div
                        key={index}
                        className='grid grid-cols-2 items-start gap-2 border-b py-2 last:border-b-0 sm:grid-cols-[1fr_80px_100px_90px_80px_40px]'
                      >
                        <div className='col-span-2 sm:col-span-1'>
                          <RenderFormField descriptor={productField} form={form} hideLabel />
                        </div>
                        <RenderFormField descriptor={quantityField} form={form} hideLabel />
                        <RenderFormField descriptor={unitPriceField} form={form} hideLabel />
                        <RenderFormField descriptor={discountField} form={form} hideLabel />
                        <RenderFormField descriptor={tvaField} form={form} hideLabel />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          disabled={linesField.state.value.length === 1}
                          onClick={() => removeLine(index)}
                          className='justify-self-end sm:justify-self-auto'
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    )
                  })
                }
              </form.Field>

              <Button type='button' variant='outline' size='sm' onClick={addLine}>
                <Plus size={14} /> Ajouter une ligne
              </Button>
            </div>

            {/* --- Totals: computed live, same formula as the backend --- */}
            <form.Subscribe
              selector={(state) => ({
                lines: state.values.lines,
                discountPercent: state.values.discount_percent,
                currency: state.values.currency,
              })}
            >
              {(sel) => {
                const breakdown = computeVenteBreakdown(sel.lines, sel.discountPercent)
                const fmt = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n)} ${sel.currency}`
                return (
                  <div className='ms-auto flex w-full max-w-xs flex-col gap-1.5 border-t pt-4 text-sm sm:w-72'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Total HT</span>
                      <span>{fmt(breakdown.subtotalHt)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Remise globale</span>
                      <span>-{fmt(breakdown.discountAmount)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>TVA</span>
                      <span>{fmt(breakdown.tvaAmount)}</span>
                    </div>
                    <div className='flex justify-between border-t pt-1.5 text-base font-bold'>
                      <span>TOTAL</span>
                      <span>{fmt(breakdown.total)}</span>
                    </div>
                  </div>
                )
              }}
            </form.Subscribe>

            <div className='flex justify-end gap-2 pt-2'>
              <Button type='button' variant='outline' onClick={() => navigate({ to: '/ventes' })}>
                Annuler
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='animate-spin' />}
                Enregistrer
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Main>
  )
}
