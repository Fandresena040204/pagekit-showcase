import { Link } from '@tanstack/react-router'
import { flexRender } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { useListPage, useTanStackRouterAdapter } from 'tanstack-pagekit'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { useProductsPage } from './resource'
import { PRODUCTS_COLUMNS } from './fields'

export function ProductsListPage() {
  const router = useTanStackRouterAdapter()

  const { table, isLoading, isError, search: runSearch } = useListPage({
    router,
    resource: { useListPage: useProductsPage },
    columns: PRODUCTS_COLUMNS,
    pagination: { defaultPageSize: 10 },
    searchMode: 'button',
    columnFilters: [
      { columnId: 'name', searchKey: 'name', type: 'string' },
      { columnId: 'sku', searchKey: 'sku', type: 'string' },
      { columnId: 'created_at', type: 'range', minSearchKey: 'created_at_min', maxSearchKey: 'created_at_max' },
    ],
  })

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Products</h2>
          <p className='text-muted-foreground'>Manage your products here.</p>
        </div>
        <Button asChild>
          <Link to='/products/saisie'>Add Product</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className='flex flex-1 items-center justify-center'>
          <Loader2 className='animate-spin' />
        </div>
      ) : isError ? (
        <p className='text-destructive'>Failed to load products.</p>
      ) : (
        <div className='flex flex-1 flex-col gap-4'>
          <DataTableToolbar
            table={table}
            textFilters={[
              { columnId: 'name', title: 'Name', placeholder: 'Search name...' },
              { columnId: 'sku', title: 'SKU', placeholder: 'Search SKU...' },
            ]}
            rangeFilters={[{ columnId: 'created_at', title: 'Created', type: 'date' }]}
            onSearch={runSearch}
          />
          <div className='overflow-hidden rounded-md border'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                      <TableCell className='text-end'>
                        <Button asChild variant='ghost' size='sm'>
                          <Link to='/products/saisie/$id' params={{ id: row.original.id }}>
                            Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={PRODUCTS_COLUMNS.length + 1} className={cn('h-24 text-center')}>
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination table={table} className='mt-auto' />
        </div>
      )}
    </Main>
  )
}
