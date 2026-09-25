import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { type FieldDescriptor, type FieldOption } from 'tanstack-pagekit'
import { customersApi } from '@/features/customers/resource'
import { productsApi } from '@/features/products/resource'
import type { Product, Vente, VenteForm, VenteStatus } from '@/features/types'

const STATUS_BADGE_VARIANT: Record<VenteStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  validated: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

/**
 * Declared once, reused as a list column (`renderColumn` in
 * `ventes-columns.tsx`) AND as a read-only detail field (`renderDetailField`
 * in `ventes-detail.tsx`) — the exact point tanstack-pagekit's `field`
 * module is meant to demonstrate. Compare with poc-vente-front's
 * `ventes-columns.tsx`, where the same descriptors only ever fed the list.
 */
export const ID_FIELD: FieldDescriptor<Vente> = {
  name: 'id',
  label: 'ID',
  type: 'text',
}

export const CUSTOMER_FIELD: FieldDescriptor<Vente> = {
  name: 'customer',
  label: 'Customer',
  type: 'select',
  clickable: true,
  linkTo: (row) => ({ to: '/customers/$id', params: { id: row.customer } }),
}

export const STATUS_FIELD: FieldDescriptor<Vente> = {
  name: 'status',
  label: 'Status',
  type: 'text',
  render: (row) => (
    <Badge variant='outline' className={cn('capitalize', STATUS_BADGE_VARIANT[row.status])}>
      {row.status}
    </Badge>
  ),
}

export const TOTAL_FIELD: FieldDescriptor<Vente> = {
  name: 'total',
  label: 'Total',
  type: 'text',
}

export function customerOptions(customerNameById: Record<string, string>): FieldOption[] {
  return Object.entries(customerNameById).map(([value, label]) => ({ value, label }))
}

// --- Form field descriptors (customer + line select-autocompletes) ---

export const CUSTOMER_FORM_FIELD: FieldDescriptor<VenteForm> = {
  name: 'customer',
  label: 'Customer',
  type: 'select',
  placeholder: 'Search a customer...',
  search: {
    fetchOptions: (query) =>
      customersApi
        .fetchList({ page: 1, pageSize: 20, search: query })
        .then((r) => r.results.map((c) => ({ label: c.name, value: c.id, data: c }))),
    resolveInitial: (id) => customersApi.fetchOne(id).then((c) => ({ label: c.name, value: c.id, data: c })),
  },
}

export function lineFormFields(index: number): FieldDescriptor<VenteForm>[] {
  return [
    {
      name: `lines[${index}].product`,
      label: 'Product',
      type: 'select',
      placeholder: 'Search a product...',
      search: {
        fetchOptions: (query) =>
          productsApi
            .fetchList({ page: 1, pageSize: 20, search: query })
            .then((r) => r.results.map((p) => ({ label: `${p.name} (${p.sku})`, value: p.id, data: p }))),
        resolveInitial: (id) =>
          productsApi.fetchOne(id).then((p) => ({ label: `${p.name} (${p.sku})`, value: p.id, data: p })),
      },
      // Selecting a product fills the line's unit price with its default
      // price — same cascade as poc-vente-front's `ventes-form.tsx`, ported
      // from react-hook-form paths (`lines.${index}.unit_price`) to
      // TanStack Form array paths (`lignes[${index}].unit_price`).
      fillsFields: (selected) => ({
        [`lines[${index}].unit_price`]: (selected.data as Product).default_price,
      }),
    },
    { name: `lines[${index}].quantity`, label: 'Quantity', type: 'number', placeholder: 'Qty' },
    { name: `lines[${index}].unit_price`, label: 'Unit price', type: 'number', placeholder: 'Unit price' },
  ]
}
