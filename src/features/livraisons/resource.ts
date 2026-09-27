import { createSubResourceHooks } from 'tanstack-pagekit'
import { httpClient } from '@/lib/http-client'
import { createCrudResource } from '@/lib/create-crud-resource'
import type { Livraison } from '@/features/types'

export const {
  api: livraisonsApi,
  useListPage: useLivraisonsPage,
  useCreate: useCreateLivraison,
  useUpdate: useUpdateLivraison,
  useDelete: useDeleteLivraison,
} = createCrudResource<Livraison, Partial<Livraison>>('livraisons', '/api/livraisons/', 'Livraison')

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
