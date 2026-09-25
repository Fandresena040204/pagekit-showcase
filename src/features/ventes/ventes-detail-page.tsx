import { useMemo } from 'react'
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { flexRender, type ColumnDef } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { renderDetailField, renderColumn, useClientTable, useDetailPage, type NavigateFn } from 'tanstack-pagekit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProducts } from '@/features/products/resource'
import { useCustomers } from '@/features/customers/resource'
import type { Vente, VenteLigne } from '@/features/types'
import { useVente } from './resource'
import { CUSTOMER_FIELD, ID_FIELD, STATUS_FIELD, TOTAL_FIELD, customerOptions } from './fields'

const TABS = ['general', 'lignes'] as const

const renderLink = ({ to, params, children }: { to: string; params?: Record<string, string>; children: unknown }) => (
  <Link to={to} params={params}>
    {children as React.ReactNode}
  </Link>
)

/**
 * Tabbed detail page — an addition beyond poc-vente-front (which has no
 * `/ventes/$id` detail route, only list + form): it demonstrates
 * `useDetailPage`/`useTabState` (active tab persisted in the URL) and the
 * "Lignes" tab reusing TanStack Table via `useClientTable`, as required.
 * The header reuses the SAME `FieldDescriptor`s as the list columns
 * (`renderDetailField` instead of `renderColumn`) — declared once in
 * `fields.tsx`.
 */
export function VentesDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn

  const { data: customers } = useCustomers()
  const customerNameById = useMemo(
    () => Object.fromEntries((customers ?? []).map((c) => [c.id, c.name])),
    [customers]
  )

  const { entity, isLoading, isError, activeTab, setActiveTab, isTabActive } = useDetailPage<Vente>({
    router: { search, navigate },
    tabs: TABS,
    defaultTab: 'general',
    useEntity: () => useVente(id),
  })

  if (isLoading) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <Loader2 className='animate-spin' />
      </Main>
    )
  }

  if (isError || !entity) {
    return (
      <Main>
        <p className='text-destructive'>Vente not found.</p>
      </Main>
    )
  }

  const headerFields = [ID_FIELD, CUSTOMER_FIELD, STATUS_FIELD, TOTAL_FIELD].map((descriptor) =>
    renderDetailField(descriptor, entity, {
      resolvedOptions: customerOptions(customerNameById),
      renderLink,
    })
  )

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Vente {entity.id}</h2>
          <p className='text-muted-foreground'>Vente details and lines.</p>
        </div>
        <Button asChild variant='outline'>
          <Link to='/ventes/saisie/$id' params={{ id: entity.id }}>
            Edit
          </Link>
        </Button>
      </div>

      <dl className='grid grid-cols-2 gap-x-6 gap-y-3 rounded-md border p-4 sm:grid-cols-4'>
        {headerFields.map((field) => (
          <div key={field.label}>
            <dt className='text-xs text-muted-foreground'>{field.label}</dt>
            <dd className='mt-0.5'>{field.value as React.ReactNode}</dd>
          </div>
        ))}
      </dl>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='general'>Général</TabsTrigger>
          <TabsTrigger value='lignes'>
            Lignes <Badge variant='secondary' className='ms-1'>{entity.lines.length}</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value='general' className='pt-4 text-sm text-muted-foreground'>
          Created {new Date(entity.created_at).toLocaleString()} · Updated{' '}
          {new Date(entity.updated_at).toLocaleString()}
        </TabsContent>
        <TabsContent value='lignes' className='pt-4'>
          {isTabActive('lignes') && <LignesTab lines={entity.lines} />}
        </TabsContent>
      </Tabs>
    </Main>
  )
}

function LignesTab({ lines }: { lines: VenteLigne[] }) {
  const { data: products } = useProducts()
  const productNameById = useMemo(
    () => Object.fromEntries((products ?? []).map((p) => [p.id, `${p.name} (${p.sku})`])),
    [products]
  )

  const columns: ColumnDef<VenteLigne>[] = useMemo(
    () => [
      renderColumn(
        { name: 'product', label: 'Product', type: 'select' },
        { resolvedOptions: Object.entries(productNameById).map(([value, label]) => ({ value, label })) }
      ),
      renderColumn({ name: 'quantity', label: 'Quantity', type: 'number' }),
      renderColumn({ name: 'unit_price', label: 'Unit price', type: 'number' }),
    ],
    [productNameById]
  )

  // TanStack Table, client-side (the lines of one vente are already fully
  // loaded — no server pagination needed here), exactly like the list
  // page's table but via `useClientTable` instead of `useListPage`.
  const { table } = useClientTable({ data: lines, columns, paginated: false })

  return (
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
