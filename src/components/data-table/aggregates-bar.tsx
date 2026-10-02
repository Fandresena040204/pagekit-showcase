type AggregateItem = { label: string; value: number | null; format?: (v: number) => string }

export function AggregatesBar({ items }: { items: AggregateItem[] }) {
  return (
    <div className='flex flex-wrap gap-6 rounded-md border bg-muted/30 px-4 py-2 text-sm'>
      {items.map((item) => (
        <div key={item.label}>
          <span className='text-muted-foreground'>{item.label} : </span>
          <span className='font-medium'>
            {item.value === null ? '—' : item.format ? item.format(item.value) : item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
