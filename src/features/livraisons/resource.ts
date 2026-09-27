import { createResourceApi, createResourceHooks, createSubResourceHooks } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'
import type { Livraison } from '@/features/types'

export const livraisonsApi = createResourceApi<Livraison, Partial<Livraison>>(
  httpClient,
  '/api/livraisons/'
)

export const {
  useListPage: useLivraisonsPage,
  useCreate: useCreateLivraison,
  useUpdate: useUpdateLivraison,
  useDelete: useDeleteLivraison,
} = createResourceHooks(['livraisons'], livraisonsApi, {
  entityLabel: 'Livraison',
  notify: {
    onCreated: (label) => toast.success(`${label} created.`),
    onUpdated: (label) => toast.success(`${label} updated.`),
    onDeleted: (label) => toast.success(`${label} deleted.`),
  },
})

// For the Vente detail page's "Livraisons" tab: `/api/livraisons/` filtered
// by `?vente=<id>` — a flat FK filter, not a nested route, which is why
// this needs `createSubResourceHooks` rather than `useLivraisonsPage`
// above (which would make the caller pass `filters: { vente: id }` by
// hand on every call).
export const { useSubResourceList: useLivraisonsByVente } = createSubResourceHooks<Livraison>(
  httpClient,
  '/api/livraisons/',
  'vente',
  ['livraisons', 'by-vente']
)
