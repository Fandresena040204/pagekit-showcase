import { createCrudResource } from '@/lib/create-crud-resource'
import type { Fournisseur, FournisseurForm } from '@/features/types'

export const {
  api: fournisseursApi,
  useList: useFournisseurs,
  useListPage: useFournisseursPage,
  useOne: useFournisseur,
  useCreate: useCreateFournisseur,
  useUpdate: useUpdateFournisseur,
  useDelete: useDeleteFournisseur,
} = createCrudResource<Fournisseur, FournisseurForm>('fournisseurs', '/api/fournisseurs/', 'Fournisseur')
