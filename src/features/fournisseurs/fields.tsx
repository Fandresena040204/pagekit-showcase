import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { renderColumn, type FieldDescriptor } from 'tanstack-pagekit'
import { renderLink } from '@/components/fields/render-link'
import { withSortableHeader } from '@/components/fields/with-sortable-header'
import type { Fournisseur, FournisseurForm } from '@/features/types'

export const NAME_FIELD: FieldDescriptor<Fournisseur> = {
  name: 'name',
  label: 'Name',
  type: 'text',
  clickable: true,
  linkTo: (row) => ({ to: '/fournisseurs/$id', params: { id: row.id } }),
}
export const EMAIL_FIELD: FieldDescriptor<Fournisseur> = { name: 'email', label: 'Email', type: 'text' }
export const ACTIVE_FIELD: FieldDescriptor<Fournisseur> = {
  name: 'is_active',
  label: 'Active',
  type: 'text',
  render: (row) => (
    <Badge variant='outline' className={row.is_active ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'}>
      {row.is_active ? 'Active' : 'Inactive'}
    </Badge>
  ),
}

// --- Form fields ---
export const NAME_FORM_FIELD: FieldDescriptor<FournisseurForm> = { name: 'name', label: 'Name', type: 'text' }
export const EMAIL_FORM_FIELD: FieldDescriptor<FournisseurForm> = { name: 'email', label: 'Email', type: 'text' }

// --- List columns ---
export const FOURNISSEURS_COLUMNS: ColumnDef<Fournisseur>[] = [
  renderColumn(NAME_FIELD, { renderLink, columnDef: withSortableHeader(NAME_FIELD) }),
  renderColumn(EMAIL_FIELD, {}),
  renderColumn(ACTIVE_FIELD, { columnDef: { enableSorting: false } }),
]
