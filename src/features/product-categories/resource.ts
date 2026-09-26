import { createResourceApi, createResourceHooks } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'
import type { ProductCategory } from '@/features/types'

export const productCategoriesApi = createResourceApi<ProductCategory, { name: string }>(
  httpClient,
  '/api/product-categories/'
)

export const {
  useList: useProductCategories,
  useListPage: useProductCategoriesPage,
  useOne: useProductCategory,
  useCreate: useCreateProductCategory,
  useUpdate: useUpdateProductCategory,
  useDelete: useDeleteProductCategory,
} = createResourceHooks(['product-categories'], productCategoriesApi, {
  entityLabel: 'Product category',
  notify: {
    onCreated: (label) => toast.success(`${label} created.`),
    onUpdated: (label) => toast.success(`${label} updated.`),
    onDeleted: (label) => toast.success(`${label} deleted.`),
  },
})
