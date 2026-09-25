import { useState } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type FieldOption } from 'tanstack-pagekit'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type SelectComboboxProps = {
  value: string | undefined
  onSelect: (option: FieldOption) => void
  options: FieldOption[]
  isLoading?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
  onSearchChange?: (query: string) => void
}

/**
 * Ported near-verbatim from poc-vente-front's `select-combobox.tsx` — same
 * Popover + cmdk combobox UI. The only thing that changed across the port
 * is where `FieldOption` comes from (`tanstack-pagekit` instead of the
 * app-local `lib/fields/field-descriptor`).
 */
export function SelectCombobox({
  value,
  onSelect,
  options,
  isLoading,
  placeholder,
  disabled,
  className,
  onSearchChange,
}: SelectComboboxProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between font-normal', className)}
        >
          <span className='truncate'>{selected ? selected.label : (placeholder ?? 'Select...')}</span>
          {isLoading ? (
            <Loader2 className='ms-2 size-4 shrink-0 animate-spin opacity-50' />
          ) : (
            <ChevronsUpDown className='ms-2 size-4 shrink-0 opacity-50' />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-(--radix-popover-trigger-width) p-0'>
        <Command shouldFilter={!onSearchChange}>
          <CommandInput placeholder='Search...' onValueChange={onSearchChange} />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onSelect(option)
                    setOpen(false)
                  }}
                >
                  <Check className={cn('me-2 size-4', option.value === value ? 'opacity-100' : 'opacity-0')} />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
