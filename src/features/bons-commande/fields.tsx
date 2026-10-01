import { type ColumnDef } from '@tanstack/react-table'
import { renderColumn, type FieldDescriptor, type FieldOption } from 'tanstack-pagekit'
import { renderLink } from '@/components/fields/render-link'
import { withSortableHeader } from '@/components/fields/with-sortable-header'
import { customersApi } from '@/features/customers/resource'
import { productsApi } from '@/features/products/resource'
import type { BonCommande, BonCommandeForm, Product } from '@/features/types'

export const ID_FIELD: FieldDescriptor<BonCommande> = {
  name: 'id',
  label: 'ID',
  type: 'text',
  clickable: true,
  linkTo: (row) => ({ to: '/bons-commande/$id', params: { id: row.id } }),
}

// No `customer_name` resolved server-side (see features/types.ts) — the
// link still works (target built from `row.customer`), the label is just
// the raw id rather than a readable name.
export const CUSTOMER_FIELD: FieldDescriptor<BonCommande> = {
  name: 'customer',
  label: 'Client',
  type: 'text',
  clickable: true,
  linkTo: (row) => ({ to: '/customers/$id', params: { id: row.customer } }),
}

export const CURRENCY_FIELD: FieldDescriptor<BonCommande> = { name: 'currency', label: 'Devise', type: 'text' }
export const CREATED_AT_FIELD: FieldDescriptor<BonCommande> = { name: 'created_at', label: 'Created', type: 'date' }

// --- Form fields ---

export const CUSTOMER_FORM_FIELD: FieldDescriptor<BonCommandeForm> = {
  name: 'customer',
  label: 'Client',
  type: 'select',
  placeholder: 'Rechercher un client...',
  search: {
    fetchOptions: (query) =>
      customersApi
        .fetchList({ page: 1, pageSize: 20, search: query })
        .then((r) => r.results.map((c) => ({ label: c.name, value: c.id, data: c }))),
    resolveInitial: (id) => customersApi.fetchOne(id).then((c) => ({ label: c.name, value: c.id, data: c })),
  },
}

const CURRENCY_OPTIONS: FieldOption[] = [
  { label: 'MGA', value: 'MGA' },
  { label: 'EUR', value: 'EUR' },
  { label: 'USD', value: 'USD' },
]

export const CURRENCY_FORM_FIELD: FieldDescriptor<BonCommandeForm> = {
  name: 'currency',
  label: 'Devise',
  type: 'select',
  options: CURRENCY_OPTIONS,
}

export const DATE_FORM_FIELD: FieldDescriptor<BonCommandeForm> = {
  name: 'expected_delivery_date',
  label: 'Date de livraison prévue',
  type: 'date',
}

export const GLOBAL_DISCOUNT_FORM_FIELD: FieldDescriptor<BonCommandeForm> = {
  name: 'discount_percent',
  label: 'Remise globale',
  type: 'number',
  placeholder: '0',
}

export function lineFormFields(index: number): FieldDescriptor<BonCommandeForm>[] {
  return [
    {
      name: `lines[${index}].product`,
      label: 'Produit',
      type: 'select',
      placeholder: 'Rechercher un produit...',
      search: {
        fetchOptions: (query) =>
          productsApi
            .fetchList({ page: 1, pageSize: 20, search: query })
            .then((r) => r.results.map((p) => ({ label: `${p.name} (${p.sku})`, value: p.id, data: p }))),
        resolveInitial: (id) =>
          productsApi.fetchOne(id).then((p) => ({ label: `${p.name} (${p.sku})`, value: p.id, data: p })),
      },
      fillsFields: (selected) => ({
        [`lines[${index}].unit_price`]: (selected.data as Product).default_price,
      }),
    },
    { name: `lines[${index}].quantity`, label: 'Qté', type: 'number', placeholder: '1' },
    { name: `lines[${index}].unit_price`, label: 'P.U.', type: 'number', placeholder: '0.00' },
    { name: `lines[${index}].discount_percent`, label: 'Remise', type: 'number', placeholder: '0' },
    { name: `lines[${index}].tva_rate`, label: 'TVA', type: 'number', placeholder: '20' },
  ]
}

export const BONS_COMMANDE_COLUMNS: ColumnDef<BonCommande>[] = [
  renderColumn(ID_FIELD, { renderLink, columnDef: { enableHiding: false, ...withSortableHeader(ID_FIELD) } }),
  renderColumn(CUSTOMER_FIELD, { renderLink, columnDef: withSortableHeader(CUSTOMER_FIELD) }),
  renderColumn(CURRENCY_FIELD, {}),
  renderColumn(CREATED_AT_FIELD, { columnDef: withSortableHeader(CREATED_AT_FIELD) }),
]
