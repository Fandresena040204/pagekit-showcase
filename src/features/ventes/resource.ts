import { createActionHook } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'
import { createCrudResource } from '@/lib/create-crud-resource'
import type { Vente, VenteForm } from '@/features/types'

function toPayload(values: VenteForm) {
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
  api: ventesApi,
  useList: useVentes,
  useListPage: useVentesPage,
  useOne: useVente,
  useCreate: useCreateVente,
  useUpdate: useUpdateVente,
  useDelete: useDeleteVente,
} = createCrudResource<Vente, VenteForm>('ventes', '/api/ventes/', 'Vente', { toPayload })

// Custom actions (not plain CRUD) — same invalidate + notify mechanics as
// the hooks above, via tanstack-pagekit's `createActionHook`. Mirror the
// backend's FSM transitions: draft -> validated -> cancelled.
export const useValiderVente = createActionHook<string>(
  ['ventes'],
  (id) => httpClient.post(`/api/ventes/${id}/valider/`, {}),
  () => toast.success('Vente validated.')
)

export const useAnnulerVente = createActionHook<string>(
  ['ventes'],
  (id) => httpClient.post(`/api/ventes/${id}/annuler/`, {}),
  () => toast.success('Vente cancelled.')
)
