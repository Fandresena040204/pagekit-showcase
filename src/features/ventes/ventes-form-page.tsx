import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useMasterDetailForm, type PrefillOptions } from 'tanstack-pagekit'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { RenderFormField } from '@/components/fields/render-form-field'
import { transformationSource } from '@/lib/transformation-source'
import { PrefillSource } from '@/lib/prefill-sources'
import type { Vente, VenteForm, VenteLineForm } from '@/features/types'
import { computeVenteBreakdown, type VenteBreakdown } from './totals'
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

const prefillSources: PrefillOptions<VenteForm>['sources'] = {
  [PrefillSource.BON_COMMANDE]: transformationSource<VenteForm>('/api/bons-commande/', 'to_vente_defaults'),
}

export function VentesFormPage() {
  const { id } = useParams({ strict: false }) as { id?: string }
  const { prefillSource, prefillId } = useSearch({ strict: false }) as {
    prefillSource?: string
    prefillId?: string
  }
  const navigate = useNavigate()

  const { form, addLine, removeLine, breakdown, isEdit, isLoading, notFound, isPending } = useMasterDetailForm<
    Vente,
    Omit<VenteForm, 'lines'>,
    VenteLineForm,
    'lines',
    VenteBreakdown
  >({
    id,
    resource: { useOne: useVente, useCreate: useCreateVente, useUpdate: useUpdateVente },
    emptyValues,
    toFormValues: (currentRow) => ({
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
    }),
    linesFieldName: 'lines',
    defaultLine: emptyLine,
    prefillSource,
    prefillId,
    prefill: { sources: prefillSources },
    computed: {
      breakdown: (lines, values) => computeVenteBreakdown(lines, values.discount_percent),
    },
    onSuccess: () => navigate({ to: '/ventes' }),
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
        <p className='text-destructive'>Vente not found.</p>
      </Main>
    )
  }

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>{isEdit ? 'Modifier la facture' : 'Nouvelle facture'}</h2>
        <p className='text-muted-foreground'>
          {isEdit ? 'Mettez à jour la vente ci-dessous.' : 'Créez une nouvelle vente ici.'}
        </p>
      </div>
      {!isEdit && prefillSource === PrefillSource.BON_COMMANDE && prefillId && (
        <p className='rounded-md border border-primary/30 bg-primary/5 px-4 py-2 text-sm'>
          Préremplie depuis le bon de commande <span className='font-medium'>{prefillId}</span>.
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className='w-full space-y-4'
      >
        {/* --- Header: Client / Date / Devise / Remise globale --- */}
        <div className='grid grid-cols-1 gap-4 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-4'>
          <RenderFormField descriptor={CUSTOMER_FORM_FIELD} form={form} />
          <RenderFormField descriptor={DATE_FORM_FIELD} form={form} />
          <RenderFormField descriptor={CURRENCY_FORM_FIELD} form={form} />
          <RenderFormField descriptor={GLOBAL_DISCOUNT_FORM_FIELD} form={form} />
        </div>

        {/* --- LIGNES --- */}
        <div className='space-y-2 rounded-md border p-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-semibold tracking-wide'>LIGNES</h3>
          </div>

          <div className='hidden grid-cols-[1fr_100px_120px_100px_90px_40px] gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid'>
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
                    className='grid grid-cols-2 items-start gap-2 border-b py-2 last:border-b-0 sm:grid-cols-[1fr_100px_120px_100px_90px_40px]'
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

        <form.Subscribe
          selector={(state) => ({
            lines: state.values.lines,
            discountPercent: state.values.discount_percent,
            currency: state.values.currency,
          })}
        >
          {(sel) => {
            const totals = breakdown() ?? { subtotalHt: 0, discountAmount: 0, tvaAmount: 0, total: 0 }
            const fmt = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n)} ${sel.currency}`
            return (
              <div className='ms-auto flex w-full max-w-xs flex-col gap-1.5 rounded-md border p-4 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Total HT</span>
                  <span>{fmt(totals.subtotalHt)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Remise globale</span>
                  <span>-{fmt(totals.discountAmount)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>TVA</span>
                  <span>{fmt(totals.tvaAmount)}</span>
                </div>
                <div className='flex justify-between border-t pt-1.5 text-base font-bold'>
                  <span>TOTAL</span>
                  <span>{fmt(totals.total)}</span>
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
      </form>
    </Main>
  )
}
