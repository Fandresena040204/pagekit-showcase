import * as React from 'react'
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { Loader2 } from 'lucide-react'
import { type Column } from '@tanstack/react-table'
import { useSearchOptions, type SearchOptionsConfig } from 'tanstack-pagekit'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

type StaticOption = {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

type DataTableFacetedFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  /**
   * Fixed, small value set (status, currency...) loaded upfront — mutually
   * exclusive with `search`. Use this when every possible value is already
   * known and short enough to list in one popover.
   */
  options?: StaticOption[]
  /**
   * Value set too large to load upfront (customers, products...): nothing
   * is shown until the user types, same debounced server search as a
   * select-autocomplete form field (`FieldDescriptor.search`) — just
   * multi-select instead of single. Mutually exclusive with `options`.
   */
  search?: SearchOptionsConfig
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options: staticOptions,
  search,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set(column?.getFilterValue() as string[])

  const searchState = useSearchOptions(search ?? { fetchOptions: async () => [] }, Array.from(selectedValues))
  const options = search ? searchState.options : (staticOptions ?? [])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <PlusCircledIcon className='size-4' />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal lg:hidden'
              >
                {selectedValues.size}
              </Badge>
              <div className='hidden space-x-1 lg:flex'>
                {selectedValues.size > 2 ? (
                  <Badge
                    variant='secondary'
                    className='rounded-sm px-1 font-normal'
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant='secondary'
                        key={option.value}
                        className='rounded-sm px-1 font-normal'
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-64 p-0' align='start'>
        {/* `shouldFilter={false}` in search mode: options are already
            filtered server-side by useSearchOptions, cmdk's own local
            substring filter would just re-narrow an already-narrow,
            already-correct list (and would hide the pinned/selected
            options that don't match the current query). */}
        <Command shouldFilter={!search}>
          <CommandInput
            placeholder={search ? `Search ${title?.toLowerCase() ?? ''}...` : title}
            onValueChange={search ? searchState.onSearchChange : undefined}
          />
          <CommandList>
            <CommandEmpty>
              {search && searchState.isLoading ? (
                <span className='inline-flex items-center gap-2'>
                  <Loader2 className='size-4 animate-spin' /> Searching...
                </span>
              ) : (
                'No results found.'
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value)
                      } else {
                        selectedValues.add(option.value)
                      }
                      const filterValues = Array.from(selectedValues)
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined
                      )
                    }}
                  >
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className={cn('h-4 w-4 text-background')} />
                    </div>
                    {'icon' in option && option.icon && (
                      <option.icon className='size-4 text-muted-foreground' />
                    )}
                    <span>{option.label}</span>
                    {/* Faceted counts come from getFacetedUniqueValues(),
                        derived from the table's own loaded rows — meaningless
                        against server-search results, so only shown for the
                        static (small, upfront-loaded) option set. */}
                    {!search && facets?.get(option.value) && (
                      <span className='ms-auto flex h-4 w-4 items-center justify-center font-mono text-xs'>
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className='justify-center text-center'
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
