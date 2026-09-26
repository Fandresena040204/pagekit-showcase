import { useMemo } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { flexRender } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { useListPage, type NavigateFn } from 'tanstack-pagekit'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { useProductCategories } from '@/features/product-categories/resource'
import { useProductsPage } from './resource'
import { createProductsColumns } from './products-columns'

export function ProductsListPage() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn

  const { data: categories, isLoading: isLoadingCategories } = useProductCategories()
  const categoryNameById = useMemo(
    () => Object.fromEntries((categories ?? []).map((c) => [c.id, c.name])),
    [categories]
  )
  const columns = useMemo(() => createProductsColumns(categoryNameById), [categoryNameById])

  const { table, isLoading, isError, search: runSearch } = useListPage({
    router: { search, navigate },
    resource: { useListPage: useProductsPage },
    columns,
    pagination: { defaultPageSize: 10 },
    globalFilter: { key: 'search' },
    searchMode: 'button',
    columnFilters: [
      { columnId: 'created_at', type: 'range', minSearchKey: 'created_at_min', maxSearchKey: 'created_at_max' },
    ],
    buildFilters: (columnFilters) => {
      const createdAt = columnFilters.find((f) => f.id === 'created_at')?.value as
        | { min?: string; max?: string }
        | undefined
      return {
        created_at_min: createdAt?.min || undefined,
        created_at_max: createdAt?.max || undefined,
      }
    },
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

      {isLoading || isLoadingCategories ? (
        <div className='flex flex-1 items-center justify-center'>
          <Loader2 className='animate-spin' />
        </div>
      ) : isError ? (
        <p className='text-destructive'>Failed to load products.</p>
      ) : (
        <div className='flex flex-1 flex-col gap-4'>
          <DataTableToolbar
            table={table}
            searchTitle='Name'
            searchPlaceholder='Search name or SKU...'
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
