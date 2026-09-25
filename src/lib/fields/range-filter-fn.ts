import { type FilterFn } from '@tanstack/react-table'

export type RangeFilterValue = { min?: string; max?: string }

/**
 * `FilterFn` TanStack Table générique pour un champ `number`/`date`/
 * `datetime` : compare la valeur de la ligne à un intervalle `{ min, max }`
 * (bornes incluses, chacune optionnelle). À brancher sur `columnDef.filterFn`
 * d'une colonne construite par `renderColumn`, en pair avec
 * `DataTableRangeFilter` côté toolbar et une entrée `type: 'range'` dans la
 * config `columnFilters` de `useTableUrlState`.
 */
export function rangeFilterFn(
  type: 'number' | 'date' | 'datetime'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): FilterFn<any> {
  return (row, columnId, filterValue: RangeFilterValue) => {
    const raw = row.getValue(columnId)
    if (raw === null || raw === undefined || raw === '') return false
    const { min, max } = filterValue ?? {}

    const value =
      type === 'number'
        ? parseFloat(String(raw))
        : new Date(raw as string | Date).getTime()

    if (min !== undefined && min !== '') {
      const minValue = type === 'number' ? parseFloat(min) : new Date(min).getTime()
      if (value < minValue) return false
    }
    if (max !== undefined && max !== '') {
      const maxValue = type === 'number' ? parseFloat(max) : new Date(max).getTime()
      if (value > maxValue) return false
    }
    return true
  }
}
