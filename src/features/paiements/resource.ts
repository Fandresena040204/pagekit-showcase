import { createSubResourceHooks } from 'tanstack-pagekit'
import { httpClient } from '@/lib/http-client'
import { createCrudResource } from '@/lib/create-crud-resource'
import type { Paiement } from '@/features/types'

export const {
  api: paiementsApi,
  useListPage: usePaiementsPage,
  useCreate: useCreatePaiement,
  useUpdate: useUpdatePaiement,
  useDelete: useDeletePaiement,
} = createCrudResource<Paiement, Partial<Paiement>>('paiements', '/api/paiements/', 'Paiement')

// Same reasoning as `useLivraisonsByVente` in livraisons/resource.ts.
export const { useSubResourceList: usePaiementsByVente } = createSubResourceHooks<Paiement>(
  httpClient,
  '/api/paiements/',
  'vente',
  ['paiements', 'by-vente']
)
