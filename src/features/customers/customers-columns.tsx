import { type ColumnDef, type HeaderContext } from '@tanstack/react-table'
import { renderColumn, type FieldDescriptor } from 'tanstack-pagekit'
import { DataTableColumnHeader } from '@/components/data-table'
import type { Customer } from '@/features/types'
import { ACTIVE_FIELD, CITY_FIELD, EMAIL_FIELD, NAME_FIELD, PHONE_FIELD } from './fields'

function withSortableHeader<TRow>(descriptor: FieldDescriptor<TRow>): Pick<ColumnDef<TRow>, 'header'> {
  return {
    header: ({ column }: HeaderContext<TRow, unknown>) => (
      <DataTableColumnHeader column={column} title={descriptor.label} />
    ),
  }
}

export function createCustomersColumns(): ColumnDef<Customer>[] {
  return [
    renderColumn(NAME_FIELD, { columnDef: withSortableHeader(NAME_FIELD) }),
    renderColumn(EMAIL_FIELD, {}),
    renderColumn(PHONE_FIELD, {}),
    renderColumn(CITY_FIELD, { columnDef: withSortableHeader(CITY_FIELD) }),
    renderColumn(ACTIVE_FIELD, { columnDef: { enableSorting: false } }),
  ]
}
