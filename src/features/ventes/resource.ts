import { createResourceApi, createResourceHooks } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'
import type { Vente, VenteForm } from '@/features/types'

function toPayload(values: VenteForm) {
  return {
    customer: values.customer,
    lines: values.lines.map((line) => ({
      ...(line.id ? { id: line.id } : {}),
      product: line.product,
      quantity: line.quantity,
      unit_price: line.unit_price,
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
