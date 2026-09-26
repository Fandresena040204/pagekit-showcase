import { createResourceApi, createResourceHooks } from 'tanstack-pagekit'
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
