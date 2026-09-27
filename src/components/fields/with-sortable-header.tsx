import { type ColumnDef, type HeaderContext } from '@tanstack/react-table'
import { type FieldDescriptor } from 'tanstack-pagekit'
import { DataTableColumnHeader } from '@/components/data-table'

/**
 * `renderColumn` is headless: its default `header` is the plain label
 * string (see tanstack-pagekit's field module), not a sortable dropdown —
 * it can't import a concrete UI component. This is the app-side adapter
 * that plugs in `DataTableColumnHeader`, shared by every feature's column
 * list instead of being redefined per feature (it used to be copy-pasted
 * identically into each `*-columns.tsx`).
 */
export function withSortableHeader<TRow>(descriptor: FieldDescriptor<TRow>): Pick<ColumnDef<TRow>, 'header'> {
  return {
    header: ({ column }: HeaderContext<TRow, unknown>) => (
      <DataTableColumnHeader column={column} title={descriptor.label} />
    ),
  }
}
