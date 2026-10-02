import { flexRender, type Table } from '@tanstack/react-table'
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type RenderTanstackTableProps<TData> = {
  table: Table<TData>
  columnCount: number
}

/** Shared TanStack Table renderer — no logic, purely `flexRender`. */
export function RenderTanstackTable<TData>({ table, columnCount }: RenderTanstackTableProps<TData>) {
  return (
    <div className='overflow-hidden rounded-md border'>
      <UITable>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columnCount} className='h-16 text-center text-muted-foreground'>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </UITable>
    </div>
  )
}
