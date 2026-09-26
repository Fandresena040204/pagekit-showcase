import { createResourceApi, createResourceHooks } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'
import type { Paiement } from '@/features/types'

export const paiementsApi = createResourceApi<Paiement, Partial<Paiement>>(
  httpClient,
  '/api/paiements/'
)

export const {
  useListPage: usePaiementsPage,
  useCreate: useCreatePaiement,
  useUpdate: useUpdatePaiement,
  useDelete: useDeletePaiement,
} = createResourceHooks(['paiements'], paiementsApi, {
  entityLabel: 'Paiement',
  notify: {
    onCreated: (label) => toast.success(`${label} created.`),
    onUpdated: (label) => toast.success(`${label} updated.`),
    onDeleted: (label) => toast.success(`${label} deleted.`),
  },
})
