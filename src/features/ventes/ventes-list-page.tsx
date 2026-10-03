import { Fragment, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { flexRender } from '@tanstack/react-table'
import { Loader2, Minus, Plus } from 'lucide-react'
import { computeColumnAggregates, useListPage, useTanStackRouterAdapter } from 'tanstack-pagekit'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AggregatesBar, DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { customersApi } from '@/features/customers/resource'
import type { Vente } from '@/features/types'
import { useVentesPage } from './resource'
import { VENTES_COLUMNS } from './fields'
import { LignesTab } from './tabs/lignes-tab'

export function VentesListPage() {
  const router = useTanStackRouterAdapter()

  const { table, data, isLoading, isError, search: runSearch } = useListPage({
    router,
    resource: { useListPage: useVentesPage },
    columns: VENTES_COLUMNS,
    pagination: { defaultPageSize: 10 },
    searchMode: 'button',
    columnFilters: [
      { columnId: 'id', searchKey: 'id', type: 'string' },
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'customer_name', searchKey: 'customer', type: 'array' },
      { columnId: 'total', type: 'range', minSearchKey: 'total_min', maxSearchKey: 'total_max' },
    ],
  })

  // Which rows show their lines under them (local UI state only). The lines
  // are already part of each Vente in the list response — no extra request.
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Computed on `data` (the current page's rows only, never the backend's
  // full count) — recalculates whenever the page/filters change.
  const aggregates = useMemo(
    () =>
      computeColumnAggregates<Vente>(data, [
        { columnId: 'total', fn: 'sum', accessor: (v) => parseFloat(v.total) },
      ]),
    [data]
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
          <AggregatesBar items={[{ label: 'Total (page)', value: aggregates.total, format: (v) => v.toFixed(2) }]} />
          <div className='overflow-hidden rounded-md border'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    <TableHead className='w-10' />
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
                    <Fragment key={row.id}>
                      <TableRow>
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='icon'
                            aria-label={expanded.has(row.original.id) ? 'Masquer les lignes' : 'Voir les lignes'}
                            onClick={() => toggleExpanded(row.original.id)}
                          >
                            {expanded.has(row.original.id) ? <Minus className='size-4' /> : <Plus className='size-4' />}
                          </Button>
                        </TableCell>
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
                      {expanded.has(row.original.id) && (
                        <TableRow>
                          <TableCell />
                          <TableCell colSpan={VENTES_COLUMNS.length + 1}>
                            <LignesTab lines={row.original.lines} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={VENTES_COLUMNS.length + 2} className={cn('h-24 text-center')}>
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
