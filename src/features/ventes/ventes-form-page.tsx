import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useMasterDetailForm, useResourceFormState, type PrefillOptions } from 'tanstack-pagekit'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { RenderFormField } from '@/components/fields/render-form-field'
import { bonsCommandeApi } from '@/features/bons-commande/resource'
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

/**
 * "NOUVELLE FACTURE" — reproduces the mockup from the lib's conception docs
 * (Concetion_moteur/lib-page-builder/05-page-formulaire.md /
 * saisie-saisiemultiple.md) as closely as the shadcn/ui primitives allow:
 * header fields (Client/Date/Devise/Remise globale), a LIGNES table
 * (Produit/Qté/P.U./Remise/TVA + delete), then a right-aligned totals
 * footer (Total HT / Remise globale / TVA / TOTAL). The breakdown is wired
 * through `useMasterDetailForm`'s own `computed.breakdown` option (not a
 * bespoke `form.Subscribe` calling app code on the side) — `totals.ts` only
 * holds the formula itself (same one as the backend's
 * `Vente.recalculate_total`, so the live preview matches what the server
 * returns on save), the *reactive wiring* to the form is the library's.
 *
 * Shell (h2/p header + full-width `rounded-md border p-4` panels) matches
 * every other saisie/consulte page in the showcase — no `Card`, no
 * `mx-auto`/`max-w-*` centering: this page occupies all of `<Main>` the
 * same way the list pages already do.
 */
const prefillSources: PrefillOptions<VenteForm>['sources'] = {
  // The real, production source: a BonCommande has its own `to_vente_defaults`
  // endpoint (apps/ventes/views/bon_commande_viewset.py) that returns a
  // payload already shaped like VenteForm — wired here exactly as
  // bons-commande-detail-page.tsx's "Vendre" button expects
  // (`prefillSource: 'bon_commande'`).
  bon_commande: (id) => bonsCommandeApi.customGet<Partial<VenteForm>>(`${id}/to_vente_defaults/`),

  // DEV-ONLY fixtures covering the 2 merge edge cases a real BonCommande
  // can't exercise on its own (it always has both a customer and at least
  // one line — see BonCommandeSerializer.validate_lines). Not reachable
  // from any UI button; navigate directly to test them:
  //   /ventes/saisie?prefillSource=test_mother&prefillId=x
  //   /ventes/saisie?prefillSource=test_lines&prefillId=x
  test_mother: async () => ({ customer: 'CUS00001', currency: 'EUR', discount_percent: '10' }),
  test_lines: async () => ({
    lines: [{ product: 'PRD00001', quantity: '3', unit_price: '9.99', discount_percent: '0', tva_rate: '20' }],
  }),
}

export function VentesFormPage() {
  const { id } = useParams({ strict: false }) as { id?: string }
  const { prefillSource, prefillId } = useSearch({ strict: false }) as {
    prefillSource?: string
    prefillId?: string
  }
  const navigate = useNavigate()

  // isEdit/isLoading/notFound/create-vs-update bookkeeping lives in the
  // library (same primitive useResourceForm uses for a plain form) —
  // useMasterDetailForm below only needs the resolved defaultValues and a
  // plain onSubmit that hands the payload to `submit`.
  const { currentRow, isEdit, isLoading, notFound, isPending, submit, prefillDefaults } = useResourceFormState<
    Vente,
    VenteForm
  >(
    id,
    { useOne: useVente, useCreate: useCreateVente, useUpdate: useUpdateVente },
    { emptyValues, prefillSource, prefillId, prefill: { sources: prefillSources } }
  )

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
      : (prefillDefaults ?? emptyValues)

  const { form, addLine, removeLine, breakdown } = useMasterDetailForm<
    Omit<VenteForm, 'lines'>,
    VenteLineForm,
    'lines',
    VenteBreakdown
  >({
    defaultValues,
    linesFieldName: 'lines',
    defaultLine: emptyLine,
    computed: {
      breakdown: (lines, values) => computeVenteBreakdown(lines, values.discount_percent),
    },
    onSubmit: async (values) => {
      await submit(values as VenteForm)
      navigate({ to: '/ventes' })
    },
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

        {/* --- Totals: `breakdown()` reads current form values on every
            call, so it needs a reactive trigger — `form.Subscribe`
            provides that (re-renders this block on lines/discount/
            currency changes), but the number themselves come from
            `useMasterDetailForm`'s `computed.breakdown`, not from
            calling `computeVenteBreakdown` directly. --- */}
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
