import { createCrudResource } from '@/lib/create-crud-resource'
import type { Product, ProductForm } from '@/features/types'

export const {
  api: productsApi,
  useList: useProducts,
  useListPage: useProductsPage,
  useOne: useProduct,
  useCreate: useCreateProduct,
  useUpdate: useUpdateProduct,
  useDelete: useDeleteProduct,
} = createCrudResource<Product, ProductForm>('products', '/api/products/', 'Product')
