import { PlusCircledIcon } from '@radix-ui/react-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

type DataTableTextFilterProps = {
  title?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

/**
 * Toolbar : filtre texte libre présenté comme un bouton nommé d'après la
 * colonne (même style que `DataTableFacetedFilter`/`DataTableRangeFilter`),
 * plutôt qu'un `<Input>` nu dont on ne sait pas ce qu'il filtre tant qu'on
 * n'a pas lu le placeholder.
 */
export function DataTableTextFilter({
  title,
  placeholder,
  value,
  onChange,
}: DataTableTextFilterProps) {
  const isActive = !!value

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
                className='max-w-32 truncate rounded-sm px-1 font-normal'
              >
                {value}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-56 space-y-2 p-3' align='start'>
        <Input
          autoFocus
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {isActive && (
          <Button
            variant='ghost'
            size='sm'
            className='w-full'
            onClick={() => onChange('')}
          >
            Clear
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
