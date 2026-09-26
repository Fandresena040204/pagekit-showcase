import { Badge } from '@/components/ui/badge'
import { type FieldDescriptor, type FieldOption } from 'tanstack-pagekit'
import { productCategoriesApi } from '@/features/product-categories/resource'
import type { Product, ProductForm } from '@/features/types'

export const NAME_FIELD: FieldDescriptor<Product> = { name: 'name', label: 'Name', type: 'text' }
export const SKU_FIELD: FieldDescriptor<Product> = { name: 'sku', label: 'SKU', type: 'text' }
export const PRICE_FIELD: FieldDescriptor<Product> = {
  name: 'default_price',
  label: 'Default price',
  type: 'number',
}
export const CATEGORY_FIELD: FieldDescriptor<Product> = {
  name: 'category',
  label: 'Category',
  type: 'select',
}
export const ACTIVE_FIELD: FieldDescriptor<Product> = {
  name: 'is_active',
  label: 'Active',
  type: 'text',
  render: (row) => (
    <Badge variant='outline' className={row.is_active ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'}>
      {row.is_active ? 'Active' : 'Inactive'}
    </Badge>
  ),
}

export function categoryOptions(categoryNameById: Record<string, string>): FieldOption[] {
  return Object.entries(categoryNameById).map(([value, label]) => ({ value, label }))
}

// --- Form fields ---

export const NAME_FORM_FIELD: FieldDescriptor<ProductForm> = { name: 'name', label: 'Name', type: 'text' }
export const SKU_FORM_FIELD: FieldDescriptor<ProductForm> = { name: 'sku', label: 'SKU', type: 'text' }
export const PRICE_FORM_FIELD: FieldDescriptor<ProductForm> = {
  name: 'default_price',
  label: 'Default price',
  type: 'number',
}
export const DESCRIPTION_FORM_FIELD: FieldDescriptor<ProductForm> = {
  name: 'description',
  label: 'Description',
  type: 'text',
}
export const CATEGORY_FORM_FIELD: FieldDescriptor<ProductForm> = {
  name: 'category',
  label: 'Category',
  type: 'select',
  placeholder: 'Select a category...',
  options: () =>
    productCategoriesApi.fetchAll().then((categories) => categories.map((c) => ({ label: c.name, value: c.id }))),
}
