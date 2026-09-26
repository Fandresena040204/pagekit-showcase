import { useMemo } from 'react'
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { flexRender, type ColumnDef } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { renderDetailField, renderColumn, useClientTable, useDetailPage, type NavigateFn } from 'tanstack-pagekit'
import { renderLink } from '@/components/fields/render-link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProducts } from '@/features/products/resource'
import { useCustomers } from '@/features/customers/resource'
import { useLivraisonsPage } from '@/features/livraisons/resource'
import { usePaiementsPage } from '@/features/paiements/resource'
import type { Livraison, Paiement, Vente, VenteLigne } from '@/features/types'
import { useAnnulerVente, useValiderVente, useVente } from './resource'
import { CURRENCY_FIELD, CUSTOMER_FIELD, ID_FIELD, STATUS_FIELD, TOTAL_FIELD, customerOptions } from './fields'

const TABS = ['lignes', 'livraisons', 'paiements'] as const

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
    defaultTab: 'lignes',
    useEntity: () => useVente(id),
  })

  const validerVente = useValiderVente()
  const annulerVente = useAnnulerVente()

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

  const headerFields = [ID_FIELD, CUSTOMER_FIELD, STATUS_FIELD, CURRENCY_FIELD, TOTAL_FIELD].map((descriptor) =>
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
        <div className='flex gap-2'>
          {/* Mirror the backend's FSM: draft -> validated -> cancelled
              (Vente.validate_vente/cancel_vente) — only the action that's a
              legal transition from the current status is shown. */}
          {entity.status === 'draft' && (
            <Button
              variant='outline'
              disabled={validerVente.isPending}
              onClick={() => validerVente.mutate(entity.id)}
            >
              {validerVente.isPending && <Loader2 className='animate-spin' />}
              Valider
            </Button>
          )}
          {entity.status === 'validated' && (
            <Button
              variant='outline'
              disabled={annulerVente.isPending}
              onClick={() => annulerVente.mutate(entity.id)}
            >
              {annulerVente.isPending && <Loader2 className='animate-spin' />}
              Annuler
            </Button>
          )}
          <Button asChild variant='outline'>
            <Link to='/ventes/saisie/$id' params={{ id: entity.id }}>
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <dl className='grid grid-cols-2 gap-x-6 gap-y-3 rounded-md border p-4 sm:grid-cols-4'>
        {headerFields.map((field) => (
          <div key={field.label}>
            <dt className='text-xs text-muted-foreground'>{field.label}</dt>
            <dd className='mt-0.5'>{field.value as React.ReactNode}</dd>
          </div>
        ))}
        <div>
          <dt className='text-xs text-muted-foreground'>Created</dt>
          <dd className='mt-0.5'>{new Date(entity.created_at).toLocaleString()}</dd>
        </div>
        <div>
          <dt className='text-xs text-muted-foreground'>Updated</dt>
          <dd className='mt-0.5'>{new Date(entity.updated_at).toLocaleString()}</dd>
        </div>
      </dl>

      {/* No "Général" tab: created_at/updated_at moved into the header
          above, Lignes/Livraisons/Paiements are the only tabs — one fewer
          click to reach the content that actually needs a table. */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='lignes'>
            Lignes <Badge variant='secondary' className='ms-1'>{entity.lines.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value='livraisons'>Livraisons</TabsTrigger>
          <TabsTrigger value='paiements'>Paiements</TabsTrigger>
        </TabsList>
        <TabsContent value='lignes' className='pt-4'>
          {isTabActive('lignes') && <LignesTab lines={entity.lines} />}
        </TabsContent>
        <TabsContent value='livraisons' className='pt-4'>
          {isTabActive('livraisons') && <LivraisonsTab venteId={entity.id} />}
        </TabsContent>
        <TabsContent value='paiements' className='pt-4'>
          {isTabActive('paiements') && <PaiementsTab venteId={entity.id} />}
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

  return <RenderTanstackTable table={table} columnCount={columns.length} />
}

const LIVRAISON_STATUS_LABEL: Record<Livraison['status'], string> = {
  pending: 'En attente',
  shipped: 'Expédiée',
  delivered: 'Livrée',
}

function LivraisonsTab({ venteId }: { venteId: string }) {
  const { data, isLoading } = useLivraisonsPage({ page: 1, pageSize: 50, filters: { vente: venteId } })

  const columns: ColumnDef<Livraison>[] = useMemo(
    () => [
      renderColumn({
        name: 'status',
        label: 'Statut',
        type: 'select',
        options: Object.entries(LIVRAISON_STATUS_LABEL).map(([value, label]) => ({ value, label })),
      }),
      renderColumn({ name: 'delivery_date', label: 'Date de livraison', type: 'date' }),
      renderColumn({ name: 'address', label: 'Adresse', type: 'text' }),
      renderColumn({ name: 'tracking_number', label: 'N° de suivi', type: 'text' }),
    ],
    []
  )

  // Every tab's table goes through TanStack Table, same as the top-level
  // list page — here via `useClientTable` since a vente's own deliveries
  // are already a small, fully-loaded set (no server pagination needed).
  const { table } = useClientTable({ data: data?.results ?? [], columns, paginated: false })

  if (isLoading) return <Loader2 className='animate-spin' />
  return <RenderTanstackTable table={table} columnCount={columns.length} />
}

const PAIEMENT_METHOD_LABEL: Record<Paiement['method'], string> = {
  cash: 'Espèces',
  card: 'Carte',
  transfer: 'Virement',
}

function PaiementsTab({ venteId }: { venteId: string }) {
  const { data, isLoading } = usePaiementsPage({ page: 1, pageSize: 50, filters: { vente: venteId } })

  const columns: ColumnDef<Paiement>[] = useMemo(
    () => [
      renderColumn({ name: 'amount', label: 'Montant', type: 'number' }),
      renderColumn({
        name: 'method',
        label: 'Méthode',
        type: 'select',
        options: Object.entries(PAIEMENT_METHOD_LABEL).map(([value, label]) => ({ value, label })),
      }),
      renderColumn({ name: 'paid_at', label: 'Date', type: 'datetime' }),
      renderColumn({ name: 'reference', label: 'Référence', type: 'text' }),
    ],
    []
  )

  const { table } = useClientTable({ data: data?.results ?? [], columns, paginated: false })

  if (isLoading) return <Loader2 className='animate-spin' />
  return <RenderTanstackTable table={table} columnCount={columns.length} />
}

/** Shared TanStack Table renderer for the three tabs above — no logic, purely `flexRender`. */
function RenderTanstackTable({
  table,
  columnCount,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any
  columnCount: number
}) {
  return (
    <div className='overflow-hidden rounded-md border'>
      <Table>
        <TableHeader>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {table.getHeaderGroups().map((headerGroup: any) => (
            <TableRow key={headerGroup.id}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {headerGroup.headers.map((header: any) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {table.getRowModel().rows.map((row: any) => (
            <TableRow key={row.id}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {row.getVisibleCells().map((cell: any) => (
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
      </Table>
    </div>
  )
}
