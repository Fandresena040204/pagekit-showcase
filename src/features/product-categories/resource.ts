import { createCrudResource } from '@/lib/create-crud-resource'
import type { ProductCategory } from '@/features/types'

export const {
  api: productCategoriesApi,
  useList: useProductCategories,
  useListPage: useProductCategoriesPage,
  useOne: useProductCategory,
  useCreate: useCreateProductCategory,
  useUpdate: useUpdateProductCategory,
  useDelete: useDeleteProductCategory,
} = createCrudResource<ProductCategory, { name: string }>(
  'product-categories',
  '/api/product-categories/',
  'Product category'
)
