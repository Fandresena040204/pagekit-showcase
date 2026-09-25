import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableRangeFilter } from './range-filter'
import { DataTableTextFilter } from './text-filter'
import { DataTableViewOptions } from './view-options'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  /** Libellé du bouton de recherche texte (ex: "Name") — le champ affiche ce qu'il filtre au lieu d'un input nu. */
  searchTitle?: string
  searchPlaceholder?: string
  searchKey?: string
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
  /** Filtres par intervalle (min/max) pour des colonnes number/date/datetime. */
  rangeFilters?: {
    columnId: string
    title: string
    type: 'number' | 'date' | 'datetime'
  }[]
  /**
   * Si fourni, les filtres (texte/popup/intervalle) n'appellent le backend
   * qu'au clic sur ce bouton "Search" — pas à chaque frappe/sélection.
   * L'appelant applique alors l'état de filtre courant (`table.getState().
   * columnFilters`) à sa requête.
   */
  onSearch?: () => void
}

export function DataTableToolbar<TData>({
  table,
  searchTitle = 'Search',
  searchPlaceholder = 'Filter...',
  searchKey,
  filters = [],
  rangeFilters = [],
  onSearch,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {searchKey ? (
          <DataTableTextFilter
            title={searchTitle}
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
            }
            onChange={(value) =>
              table.getColumn(searchKey)?.setFilterValue(value || undefined)
            }
          />
        ) : (
          <DataTableTextFilter
            title={searchTitle}
            placeholder={searchPlaceholder}
            value={table.getState().globalFilter ?? ''}
            onChange={(value) => table.setGlobalFilter(value)}
          />
        )}
        <div className='flex gap-x-2'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column) return null
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            )
          })}
          {rangeFilters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column) return null
            return (
              <DataTableRangeFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                type={filter.type}
              />
            )
          })}
        </div>
        {onSearch && (
          <Button size='sm' className='h-8' onClick={onSearch}>
            <MagnifyingGlassIcon className='size-4' />
            Search
          </Button>
        )}
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter('')
            }}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
