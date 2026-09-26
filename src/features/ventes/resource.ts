import { createActionHook, createResourceApi, createResourceHooks } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'
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

export const ventesApi = createResourceApi<Vente, VenteForm>(httpClient, '/api/ventes/', { toPayload })

export const {
  useList: useVentes,
  useListPage: useVentesPage,
  useOne: useVente,
  useCreate: useCreateVente,
  useUpdate: useUpdateVente,
  useDelete: useDeleteVente,
} = createResourceHooks(['ventes'], ventesApi, {
  entityLabel: 'Vente',
  notify: {
    onCreated: (label) => toast.success(`${label} created.`),
    onUpdated: (label) => toast.success(`${label} updated.`),
    onDeleted: (label) => toast.success(`${label} deleted.`),
  },
})

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
