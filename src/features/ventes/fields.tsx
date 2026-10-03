import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { renderColumn, type FieldDescriptor, type FieldOption } from 'tanstack-pagekit'
import { renderLink } from '@/components/fields/render-link'
import { withSortableHeader } from '@/components/fields/with-sortable-header'
import { customersApi } from '@/features/customers/resource'
import { productsApi } from '@/features/products/resource'
import type { Product, Vente, VenteForm, VenteStatus } from '@/features/types'
import { VentesPreviewLivraisons } from './ventes-preview-livraisons'

const arrayFilter = (row: { getValue: (id: string) => unknown }, id: string, value: string[]) =>
  value.includes(row.getValue(id) as string)

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
  clickable: true,
  linkTo: (row) => ({ to: '/ventes/$id', params: { id: row.id } }),
}

// `customer_name` (resolved server-side) drives display, `customer` (the
// raw id) drives the link target — same "display one field, link via
// another" pattern as Product.name (see products/fields.tsx). No
// `resolvedOptions`/client-side lookup needed at all anymore.
export const CUSTOMER_FIELD: FieldDescriptor<Vente> = {
  name: 'customer_name',
  label: 'Customer',
  type: 'text',
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

export const CURRENCY_FIELD: FieldDescriptor<Vente> = {
  name: 'currency',
  label: 'Devise',
  type: 'text',
}

// --- Form field descriptors: header (parent) fields of "NOUVELLE FACTURE" ---

export const CUSTOMER_FORM_FIELD: FieldDescriptor<VenteForm> = {
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

// Django's `Vente` has no free-standing "invoice date" (only
// `expected_delivery_date`, `created_at`/`updated_at`) — this form reuses
// `expected_delivery_date` under the mockup's "Date" label, since it's the
// only editable date field the backend actually exposes on Vente.
export const DATE_FORM_FIELD: FieldDescriptor<VenteForm> = {
  name: 'expected_delivery_date',
  label: 'Date',
  type: 'date',
}

const CURRENCY_OPTIONS: FieldOption[] = [
  { label: 'MGA', value: 'MGA' },
  { label: 'EUR', value: 'EUR' },
  { label: 'USD', value: 'USD' },
]

export const CURRENCY_FORM_FIELD: FieldDescriptor<VenteForm> = {
  name: 'currency',
  label: 'Devise',
  type: 'select',
  options: CURRENCY_OPTIONS,
}

export const GLOBAL_DISCOUNT_FORM_FIELD: FieldDescriptor<VenteForm> = {
  name: 'discount_percent',
  label: 'Remise globale',
  type: 'number',
  placeholder: '0',
}

// --- Form field descriptors: one line of "LIGNES" (Produit / Qté / P.U. / Remise / TVA) ---

export function lineFormFields(index: number): FieldDescriptor<VenteForm>[] {
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
      // Selecting a product fills the line's unit price with its default
      // price — same cascade as poc-vente-front's `ventes-form.tsx`, ported
      // from react-hook-form paths (`lines.${index}.unit_price`) to
      // TanStack Form array paths (`lines[${index}].unit_price`).
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

// --- List columns: built once from the field descriptors above, module-
// scoped (no props) — a plain constant, not a factory + useMemo in the
// list page.
export const VENTES_COLUMNS: ColumnDef<Vente>[] = [
  renderColumn(ID_FIELD, { renderLink, columnDef: { enableHiding: false, ...withSortableHeader(ID_FIELD) } }),
  // `customer_name` is resolved server-side (VenteSerializer) — no
  // `resolvedOptions`/client-side id->name map needed. Sorting now happens
  // on the readable name too, not the opaque id.
  renderColumn(CUSTOMER_FIELD, { renderLink, columnDef: withSortableHeader(CUSTOMER_FIELD) }),
  renderColumn(STATUS_FIELD, { columnDef: { filterFn: arrayFilter, enableSorting: false } }),
  renderColumn(TOTAL_FIELD, { columnDef: withSortableHeader(TOTAL_FIELD) }),
  // Action column, not a data field — not built via `renderColumn`/
  // `FieldDescriptor` (those describe an entity field, not a UI action).
  {
    id: 'preview',
    header: '',
    cell: ({ row }) => <VentesPreviewLivraisons venteId={row.original.id} />,
  },
]
