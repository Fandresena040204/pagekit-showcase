import { createActionHook } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'
import { createCrudResource } from '@/lib/create-crud-resource'
import { invalidateAfterWorkflow } from '@/lib/cache-rules'
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

// One generic action for every workflow step (valider_achat, rejeter_achat,
// valider_caisse, ..., annuler) — mirrors the backend's generic
// `POST /api/ventes/{id}/transition/{step}/` (WorkflowMixin, see
// apps/accounts/workflow.py). Which steps are actually callable comes from
// `Vente.allowed_steps` (server-computed), not from this hook.
//
// The transition response now returns the full entity (same shape as GET detail),
// so we update the detail cache immediately for instant feedback, then invalidate
// all business data (except stable catalogs) to pick up side effects like new livraisons.
export const useVenteTransition = createActionHook<{ id: string; step: string }, Vente>(
  ['ventes'],
  async ({ id, step }) => {
    const response = await httpClient.post<Vente>(`/api/ventes/${id}/transition/${step}/`, {})
    return response.data
  },
  (data, { id }, client) => {
    // Immediate detail update for instant UI feedback
    client.setQueryData(['ventes', 'one', id], data)
    toast.success('Vente mise à jour.')
  },
  { invalidates: invalidateAfterWorkflow }
)
