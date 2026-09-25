import { PlusCircledIcon } from '@radix-ui/react-icons'
import { type Column } from '@tanstack/react-table'
import { type RangeFilterValue } from '@/lib/fields/range-filter-fn'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

const HTML_INPUT_TYPE = {
  number: 'number',
  date: 'date',
  datetime: 'datetime-local',
} as const

type DataTableRangeFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  type: 'number' | 'date' | 'datetime'
}

/**
 * Toolbar : filtre par intervalle (min/max) pour une colonne `number`/
 * `date`/`datetime` — pendant de `DataTableFacetedFilter` pour les valeurs
 * continues plutôt que discrètes. À utiliser avec `rangeFilterFn` en
 * `columnDef.filterFn`.
 */
export function DataTableRangeFilter<TData, TValue>({
  column,
  title,
  type,
}: DataTableRangeFilterProps<TData, TValue>) {
  const value = (column?.getFilterValue() as RangeFilterValue | undefined) ?? {}
  const isActive = !!(value.min || value.max)

  function setRange(patch: Partial<RangeFilterValue>) {
    const next = { ...value, ...patch }
    column?.setFilterValue(next.min || next.max ? next : undefined)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <PlusCircledIcon className='size-4' />
          {title}
          {isActive && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal'
              >
                {value.min || '…'} – {value.max || '…'}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-64 space-y-3 p-3' align='start'>
        <div className='space-y-1'>
          <Label htmlFor={`range-min-${title}`}>Min</Label>
          <Input
            id={`range-min-${title}`}
            type={HTML_INPUT_TYPE[type]}
            value={value.min ?? ''}
            onChange={(e) => setRange({ min: e.target.value || undefined })}
          />
        </div>
        <div className='space-y-1'>
          <Label htmlFor={`range-max-${title}`}>Max</Label>
          <Input
            id={`range-max-${title}`}
            type={HTML_INPUT_TYPE[type]}
            value={value.max ?? ''}
            onChange={(e) => setRange({ max: e.target.value || undefined })}
          />
        </div>
        {isActive && (
          <Button
            variant='ghost'
            size='sm'
            className='w-full'
            onClick={() => column?.setFilterValue(undefined)}
          >
            Clear
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
