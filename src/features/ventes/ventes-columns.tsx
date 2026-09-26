import { type ColumnDef, type HeaderContext } from '@tanstack/react-table'
import { renderColumn, type FieldDescriptor, type FieldOption } from 'tanstack-pagekit'
import { renderLink } from '@/components/fields/render-link'
import { DataTableColumnHeader } from '@/components/data-table'
import type { Vente } from '@/features/types'
import { CUSTOMER_FIELD, ID_FIELD, STATUS_FIELD, TOTAL_FIELD, customerOptions } from './fields'

const arrayFilter = (row: { getValue: (id: string) => unknown }, id: string, value: string[]) =>
  value.includes(row.getValue(id) as string)

// `renderColumn` is headless: its default `header` is the plain label
// string (see tanstack-pagekit's field module), not a sortable dropdown —
// it can't import a concrete UI component. `withSortableHeader` is the
// app-side adapter that plugs in `DataTableColumnHeader`, ported as-is from
// poc-vente-front where it was baked into `render-column.tsx` directly
// (there, that file already lived in the app layer, not a headless lib).
function withSortableHeader<TRow>(descriptor: FieldDescriptor<TRow>): Pick<ColumnDef<TRow>, 'header'> {
  return {
    header: ({ column }: HeaderContext<TRow, unknown>) => (
      <DataTableColumnHeader column={column} title={descriptor.label} />
    ),
  }
}

export function createVentesColumns(customerNameById: Record<string, string>): ColumnDef<Vente>[] {
  const options: FieldOption[] = customerOptions(customerNameById)

  return [
    renderColumn(ID_FIELD, { renderLink, columnDef: { enableHiding: false, ...withSortableHeader(ID_FIELD) } }),
    renderColumn(CUSTOMER_FIELD, {
      resolvedOptions: options,
      renderLink,
      columnDef: { filterFn: arrayFilter, ...withSortableHeader(CUSTOMER_FIELD) },
    }),
    renderColumn(STATUS_FIELD, { columnDef: { filterFn: arrayFilter, enableSorting: false } }),
    renderColumn(TOTAL_FIELD, { columnDef: withSortableHeader(TOTAL_FIELD) }),
  ]
}
