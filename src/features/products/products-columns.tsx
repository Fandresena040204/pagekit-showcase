import { type ColumnDef, type HeaderContext } from '@tanstack/react-table'
import { renderColumn, type FieldDescriptor, type FieldOption } from 'tanstack-pagekit'
import { renderLink } from '@/components/fields/render-link'
import { DataTableColumnHeader } from '@/components/data-table'
import type { Product } from '@/features/types'
import {
  ACTIVE_FIELD,
  CATEGORY_FIELD,
  CREATED_AT_FIELD,
  NAME_FIELD,
  PRICE_FIELD,
  SKU_FIELD,
  categoryOptions,
} from './fields'
import { rangeFilterFn } from '@/lib/fields/range-filter-fn'

function withSortableHeader<TRow>(descriptor: FieldDescriptor<TRow>): Pick<ColumnDef<TRow>, 'header'> {
  return {
    header: ({ column }: HeaderContext<TRow, unknown>) => (
      <DataTableColumnHeader column={column} title={descriptor.label} />
    ),
  }
}

export function createProductsColumns(categoryNameById: Record<string, string>): ColumnDef<Product>[] {
  const options: FieldOption[] = categoryOptions(categoryNameById)

  return [
    renderColumn(NAME_FIELD, { renderLink, columnDef: withSortableHeader(NAME_FIELD) }),
    renderColumn(SKU_FIELD, { columnDef: withSortableHeader(SKU_FIELD) }),
    renderColumn(PRICE_FIELD, { columnDef: withSortableHeader(PRICE_FIELD) }),
    renderColumn(CATEGORY_FIELD, { resolvedOptions: options }),
    renderColumn(ACTIVE_FIELD, { columnDef: { enableSorting: false } }),
    renderColumn(CREATED_AT_FIELD, {
      columnDef: { filterFn: rangeFilterFn('date'), ...withSortableHeader(CREATED_AT_FIELD) },
    }),
  ]
}
