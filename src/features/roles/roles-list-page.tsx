import { useMemo } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { flexRender, type ColumnDef, type HeaderContext } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { renderColumn, useListPage, type FieldDescriptor, type NavigateFn } from 'tanstack-pagekit'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTableColumnHeader, DataTablePagination, DataTableToolbar } from '@/components/data-table'
import type { Role } from '@/features/types'
import { useRolesPage } from './resource'

const renderLink = ({ to, params, children }: { to: string; params?: Record<string, string>; children: unknown }) => (
  <Link to={to} params={params}>
    {children as React.ReactNode}
  </Link>
)

const NAME_FIELD: FieldDescriptor<Role> = {
  name: 'name',
  label: 'Name',
  type: 'text',
  clickable: true,
  linkTo: (row) => ({ to: '/roles/$id', params: { id: row.id } }),
}

function withSortableHeader<TRow>(descriptor: FieldDescriptor<TRow>): Pick<ColumnDef<TRow>, 'header'> {
  return {
    header: ({ column }: HeaderContext<TRow, unknown>) => (
      <DataTableColumnHeader column={column} title={descriptor.label} />
    ),
  }
}

export function RolesListPage() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn

  const columns: ColumnDef<Role>[] = useMemo(
    () => [
      renderColumn(NAME_FIELD, { renderLink, columnDef: withSortableHeader(NAME_FIELD) }),
      renderColumn(
        { name: 'permissions', label: 'Permissions', type: 'text' },
        { columnDef: { cell: ({ row }) => `${row.original.permissions.length} permission(s)`, enableSorting: false } }
      ),
    ],
    []
  )

  const { table, isLoading, isError, search: runSearch } = useListPage({
    router: { search, navigate },
    resource: { useListPage: useRolesPage },
    columns,
    pagination: { defaultPageSize: 10 },
    globalFilter: { key: 'search' },
    searchMode: 'button',
  })

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Roles</h2>
          <p className='text-muted-foreground'>Manage roles and their permissions.</p>
        </div>
        <Button asChild>
          <Link to='/roles/saisie'>Add Role</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className='flex flex-1 items-center justify-center'>
          <Loader2 className='animate-spin' />
        </div>
      ) : isError ? (
        <p className='text-destructive'>Failed to load roles.</p>
      ) : (
        <div className='flex flex-1 flex-col gap-4'>
          <DataTableToolbar table={table} searchTitle='Name' searchPlaceholder='Search name...' onSearch={runSearch} />
          <div className='overflow-hidden rounded-md border'>
            <Table>
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
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                      <TableCell className='text-end'>
                        <Button asChild variant='ghost' size='sm'>
                          <Link to='/roles/saisie/$id' params={{ id: row.original.id }}>
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
