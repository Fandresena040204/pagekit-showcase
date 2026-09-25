import { createResourceApi, createResourceHooks } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'
import type { Product, ProductForm } from '@/features/types'

export const productsApi = createResourceApi<Product, ProductForm>(httpClient, '/api/products/')

export const {
  useList: useProducts,
  useListPage: useProductsPage,
  useOne: useProduct,
  useCreate: useCreateProduct,
  useUpdate: useUpdateProduct,
  useDelete: useDeleteProduct,
} = createResourceHooks(['products'], productsApi, {
  entityLabel: 'Product',
  notify: {
    onCreated: (label) => toast.success(`${label} created.`),
    onUpdated: (label) => toast.success(`${label} updated.`),
    onDeleted: (label) => toast.success(`${label} deleted.`),
  },
})
