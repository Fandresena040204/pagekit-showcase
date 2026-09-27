import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { flexRender } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { useListPage, useTanStackRouterAdapter } from 'tanstack-pagekit'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { customersApi } from '@/features/customers/resource'
import { useVentesPage } from './resource'
import { createVentesColumns } from './ventes-columns'

export function VentesListPage() {
  const router = useTanStackRouterAdapter()

  const columns = useMemo(() => createVentesColumns(), [])

  const { table, isLoading, isError, search: runSearch } = useListPage({
    router,
    resource: { useListPage: useVentesPage },
    columns,
    pagination: { defaultPageSize: 10 },
    searchMode: 'button',
    columnFilters: [
      { columnId: 'id', searchKey: 'id', type: 'string' },
      { columnId: 'status', searchKey: 'status', type: 'array' },
      // Column id is `customer_name` (what's displayed/sorted) but the
      // backend param stays `customer` (still filters by id — the facet's
      // selected VALUES are ids, only the column's own cell shows a name).
      { columnId: 'customer_name', searchKey: 'customer', type: 'array' },
      { columnId: 'total', type: 'range', minSearchKey: 'total_min', maxSearchKey: 'total_max' },
    ],
  })

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Ventes</h2>
          <p className='text-muted-foreground'>Manage your ventes here.</p>
        </div>
        <Button asChild>
          <Link to='/ventes/saisie'>Add Vente</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className='flex flex-1 items-center justify-center'>
          <Loader2 className='animate-spin' />
        </div>
      ) : isError ? (
        <p className='text-destructive'>Failed to load ventes.</p>
      ) : (
        <div className='flex flex-1 flex-col gap-4'>
          <DataTableToolbar
            table={table}
            textFilters={[{ columnId: 'id', title: 'ID', placeholder: 'Rechercher par ID...' }]}
            filters={[
              {
                columnId: 'status',
                title: 'Status',
                options: [
                  { label: 'Draft', value: 'draft' },
                  { label: 'Validated', value: 'validated' },
                  { label: 'Cancelled', value: 'cancelled' },
                ],
              },
              {
                columnId: 'customer_name',
                title: 'Customer',
                search: {
                  fetchOptions: (query) =>
                    customersApi
                      .fetchList({ page: 1, pageSize: 5, search: query })
                      .then((r) => r.results.map((c) => ({ label: c.name, value: c.id }))),
                  resolveInitial: (id) =>
                    customersApi.fetchOne(id).then((c) => ({ label: c.name, value: c.id })),
                },
              },
            ]}
            rangeFilters={[{ columnId: 'total', title: 'Total', type: 'number' }]}
            onSearch={runSearch}
          />
          <div className='overflow-hidden rounded-md border'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
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
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                      <TableCell className='text-end'>
                        <Button asChild variant='ghost' size='sm'>
                          <Link to='/ventes/saisie/$id' params={{ id: row.original.id }}>
                            Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className={cn('h-24 text-center')}>
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
