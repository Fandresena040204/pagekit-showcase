import { createCrudResource } from '@/lib/create-crud-resource'
import type { BonCommande, BonCommandeForm } from '@/features/types'

function toPayload(values: BonCommandeForm) {
  return {
    customer: values.customer,
    currency: values.currency,
    discount_percent: values.discount_percent,
    expected_delivery_date: values.expected_delivery_date || null,
    lines: values.lines.map((line) => ({
      ...(line.id ? { id: line.id } : {}),
      product: line.product,
      quantity: line.quantity,
      unit_price: line.unit_price,
      discount_percent: line.discount_percent,
      tva_rate: line.tva_rate,
    })),
  }
}

export const {
  api: bonsCommandeApi,
  useList: useBonsCommande,
  useListPage: useBonsCommandePage,
  useOne: useBonCommande,
  useCreate: useCreateBonCommande,
  useUpdate: useUpdateBonCommande,
  useDelete: useDeleteBonCommande,
} = createCrudResource<BonCommande, BonCommandeForm>('bons_commande', '/api/bons-commande/', 'BonCommande', {
  toPayload,
})
