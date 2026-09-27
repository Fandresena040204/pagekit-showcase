import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { renderColumn, type FieldDescriptor } from 'tanstack-pagekit'
import { renderLink } from '@/components/fields/render-link'
import { withSortableHeader } from '@/components/fields/with-sortable-header'
import type { Customer, CustomerForm } from '@/features/types'

export const NAME_FIELD: FieldDescriptor<Customer> = {
  name: 'name',
  label: 'Name',
  type: 'text',
  clickable: true,
  linkTo: (row) => ({ to: '/customers/$id', params: { id: row.id } }),
}
export const EMAIL_FIELD: FieldDescriptor<Customer> = { name: 'email', label: 'Email', type: 'text' }
export const PHONE_FIELD: FieldDescriptor<Customer> = { name: 'phone', label: 'Phone', type: 'text' }
export const CITY_FIELD: FieldDescriptor<Customer> = { name: 'city', label: 'City', type: 'text' }
export const ACTIVE_FIELD: FieldDescriptor<Customer> = {
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
export const NAME_FORM_FIELD: FieldDescriptor<CustomerForm> = { name: 'name', label: 'Name', type: 'text' }
export const EMAIL_FORM_FIELD: FieldDescriptor<CustomerForm> = { name: 'email', label: 'Email', type: 'text' }
export const PHONE_FORM_FIELD: FieldDescriptor<CustomerForm> = { name: 'phone', label: 'Phone', type: 'text' }
export const ADDRESS_FORM_FIELD: FieldDescriptor<CustomerForm> = { name: 'address', label: 'Address', type: 'text' }
export const CITY_FORM_FIELD: FieldDescriptor<CustomerForm> = { name: 'city', label: 'City', type: 'text' }
export const BIRTH_DATE_FORM_FIELD: FieldDescriptor<CustomerForm> = {
  name: 'birth_date',
  label: 'Birth date',
  type: 'date',
}

// --- List columns ---
export const CUSTOMERS_COLUMNS: ColumnDef<Customer>[] = [
  renderColumn(NAME_FIELD, { renderLink, columnDef: withSortableHeader(NAME_FIELD) }),
  renderColumn(EMAIL_FIELD, {}),
  renderColumn(PHONE_FIELD, {}),
  renderColumn(CITY_FIELD, { columnDef: withSortableHeader(CITY_FIELD) }),
  renderColumn(ACTIVE_FIELD, { columnDef: { enableSorting: false } }),
]
