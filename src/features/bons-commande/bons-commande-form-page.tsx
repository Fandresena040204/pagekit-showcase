import { ApiErrorState } from '@/components/errors/api-error-state'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useMasterDetailForm } from 'tanstack-pagekit'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { RenderFormField } from '@/components/fields/render-form-field'
import type { BonCommande, BonCommandeForm, BonCommandeLineForm } from '@/features/types'
import { useBonCommande, useCreateBonCommande, useUpdateBonCommande } from './resource'
import {
  CUSTOMER_FORM_FIELD,
  DATE_FORM_FIELD,
  CURRENCY_FORM_FIELD,
  GLOBAL_DISCOUNT_FORM_FIELD,
  lineFormFields,
} from './fields'

const emptyLine: BonCommandeLineForm = {
  product: '',
  quantity: '1',
  unit_price: '0.00',
  discount_percent: '0',
  tva_rate: '20',
}

const emptyValues: BonCommandeForm = {
  customer: '',
  currency: 'MGA',
  discount_percent: '0',
  expected_delivery_date: '',
  lines: [emptyLine],
}

/**
 * Same master/detail shape as VentesFormPage — mère (Client/Date/Devise/
 * Remise globale) + tableau de lignes éditable — but without a totals
 * breakdown footer: BonCommande has no server-computed total (see
 * apps/ventes/models/bon_commande.py), it's not a document that gets paid,
 * only transformed into a Vente later (which recomputes its own total).
 */
export function BonsCommandeFormPage() {
  const { id } = useParams({ strict: false }) as { id?: string }
  const navigate = useNavigate()

  const { form, addLine, removeLine, isEdit, isLoading, notFound, isPending } = useMasterDetailForm<
    BonCommande,
    Omit<BonCommandeForm, 'lines'>,
    BonCommandeLineForm,
    'lines'
  >({
    id,
    resource: { useOne: useBonCommande, useCreate: useCreateBonCommande, useUpdate: useUpdateBonCommande },
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
    onSuccess: () => navigate({ to: '/bons-commande' }),
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
        <h2 className='text-2xl font-bold tracking-tight'>
          {isEdit ? 'Modifier le bon de commande' : 'Nouveau bon de commande'}
        </h2>
        <p className='text-muted-foreground'>
          {isEdit ? 'Mettez à jour le bon de commande ci-dessous.' : 'Créez un nouveau bon de commande ici.'}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className='w-full space-y-4'
      >
        <div className='grid grid-cols-1 gap-4 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-4'>
          <RenderFormField descriptor={CUSTOMER_FORM_FIELD} form={form} />
          <RenderFormField descriptor={DATE_FORM_FIELD} form={form} />
          <RenderFormField descriptor={CURRENCY_FORM_FIELD} form={form} />
          <RenderFormField descriptor={GLOBAL_DISCOUNT_FORM_FIELD} form={form} />
        </div>

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
              linesField.state.value.map((_: BonCommandeLineForm, index: number) => {
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

        <div className='flex justify-end gap-2 pt-2'>
          <Button type='button' variant='outline' onClick={() => navigate({ to: '/bons-commande' })}>
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
