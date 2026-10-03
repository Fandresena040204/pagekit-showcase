import { useMemo } from 'react'
import { flexRender, type ColumnDef, type HeaderContext } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { renderColumn, useListPage, useTanStackRouterAdapter, type FieldDescriptor } from 'tanstack-pagekit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Main } from '@/components/layout/main'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTableColumnHeader, DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { renderLink } from '@/components/fields/render-link'
import type { User } from '@/features/types'
import { useRoles } from '@/features/roles/resource'
import { useUsersPage } from './resource'

const USERNAME_FIELD: FieldDescriptor<User> = {
  name: 'username',
  label: 'Username',
  type: 'text',
  clickable: true,
  linkTo: (row) => ({ to: '/users/$id', params: { id: row.id } }),
}
const EMAIL_FIELD: FieldDescriptor<User> = { name: 'email', label: 'Email', type: 'text' }

function withSortableHeader<TRow>(descriptor: FieldDescriptor<TRow>): Pick<ColumnDef<TRow>, 'header'> {
  return {
    header: ({ column }: HeaderContext<TRow, unknown>) => (
      <DataTableColumnHeader column={column} title={descriptor.label} />
    ),
  }
}

/**
 * Django's UserViewSet is read-only (see resource.ts) — no "Add User" here,
 * matching what the real API actually supports. Roles and permission
 * overrides are edited on their own pages (users/$id/roles,
 * users/$id/permissions), with the same Enregistrer/Annuler flow as Roles.
 */
export function UsersListPage() {
  const router = useTanStackRouterAdapter()

  const { data: roles } = useRoles()
  const roleOptions = useMemo(() => (roles ?? []).map((r) => ({ label: r.name, value: r.name })), [roles])

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      renderColumn(USERNAME_FIELD, { renderLink, columnDef: withSortableHeader(USERNAME_FIELD) }),
      renderColumn(EMAIL_FIELD, {}),
      renderColumn(
        { name: 'roles', label: 'Roles', type: 'text' },
        {
          columnDef: {
            id: 'roles',
            enableSorting: false,
            cell: ({ row }) => (
              <div className='flex flex-wrap gap-1'>
                {row.original.roles.length ? (
                  row.original.roles.map((r) => (
                    <Badge key={r} variant='secondary' className='capitalize'>
                      {r}
                    </Badge>
                  ))
                ) : (
                  <span className='text-muted-foreground'>None</span>
                )}
              </div>
            ),
          },
        }
      ),
    ],
    []
  )

  const { table, isLoading, isError, search: runSearch } = useListPage({
    router,
    resource: { useListPage: useUsersPage },
    columns,
    pagination: { defaultPageSize: 10 },
    searchMode: 'button',
    columnFilters: [
      { columnId: 'username', searchKey: 'username', type: 'string' },
      { columnId: 'roles', searchKey: 'roles', type: 'array' },
    ],
  })

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Users</h2>
        <p className='text-muted-foreground'>Gérez les rôles et les permissions de chaque utilisateur. Les comptes ne se créent pas depuis cette page.</p>
      </div>

      {isLoading ? (
        <div className='flex flex-1 items-center justify-center'>
          <Loader2 className='animate-spin' />
        </div>
      ) : isError ? (
        <p className='text-destructive'>Failed to load users.</p>
      ) : (
        <div className='flex flex-1 flex-col gap-4'>
          <DataTableToolbar
            table={table}
            textFilters={[{ columnId: 'username', title: 'Username', placeholder: 'Search username...' }]}
            filters={[{ columnId: 'roles', title: 'Role', options: roleOptions }]}
            onSearch={runSearch}
          />
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
                          <Link to='/users/$id/roles' params={{ id: row.original.id }}>
                            Manage roles
                          </Link>
                        </Button>
                        <Button asChild variant='ghost' size='sm'>
                          <Link to='/users/$id/permissions' params={{ id: row.original.id }}>
                            Manage permissions
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
