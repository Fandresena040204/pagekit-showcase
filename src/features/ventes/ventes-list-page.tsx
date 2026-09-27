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
import { useCustomers } from '@/features/customers/resource'
import { useVentesPage } from './resource'
import { createVentesColumns } from './ventes-columns'

/**
 * List page: pagination and filters are sent to the real Django backend
 * (server-side), sorting stays client-side on the loaded page via TanStack
 * Table (`getSortedRowModel`, wired inside `useListPage`). `searchMode:
 * 'button'` means typing in the search box or toggling a checkbox filter
 * only updates the table's own UI/URL state — the actual backend query
 * only refreshes when the "Search" button (`search()`) is clicked, same
 * "popup filter, committed on Search" UX as poc-vente-front's
 * `ventes-table.tsx` (`appliedFilters` state there).
 */
export function VentesListPage() {
  const router = useTanStackRouterAdapter()

  const { data: customers, isLoading: isLoadingCustomers } = useCustomers()
  const customerNameById = useMemo(
    () => Object.fromEntries((customers ?? []).map((c) => [c.id, c.name])),
    [customers]
  )
  const columns = useMemo(() => createVentesColumns(customerNameById), [customerNameById])

  const { table, isLoading, isError, search: runSearch } = useListPage({
    router,
    resource: { useListPage: useVentesPage },
    columns,
    pagination: { defaultPageSize: 10 },
    globalFilter: { key: 'search' },
    searchMode: 'button',
    // Backend query params (status, customer, total_min/total_max) are
    // derived automatically from this config — no buildFilters needed.
    columnFilters: [
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'customer', searchKey: 'customer', type: 'array' },
      { columnId: 'total', type: 'range', minSearchKey: 'total_min', maxSearchKey: 'total_max' },
    ],
  })

  const customerFacetOptions = useMemo(
    () => Object.entries(customerNameById).map(([value, label]) => ({ label, value })),
    [customerNameById]
  )

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

      {isLoading || isLoadingCustomers ? (
        <div className='flex flex-1 items-center justify-center'>
          <Loader2 className='animate-spin' />
        </div>
      ) : isError ? (
        <p className='text-destructive'>Failed to load ventes.</p>
      ) : (
        <div className='flex flex-1 flex-col gap-4'>
          <DataTableToolbar
            table={table}
            searchTitle='ID'
            searchPlaceholder='Rechercher par ID...'
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
                columnId: 'customer',
                title: 'Customer',
                options: customerFacetOptions,
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
