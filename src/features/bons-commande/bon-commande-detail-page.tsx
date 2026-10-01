import { useMemo } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { flexRender, type ColumnDef } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { renderDetailField, renderColumn, useClientTable } from 'tanstack-pagekit'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { renderLink } from '@/components/fields/render-link'
import type { BonCommandeLigne } from '@/features/types'
import { useBonCommande } from './resource'
import { CURRENCY_FIELD, CUSTOMER_FIELD } from './fields'

export function BonCommandeDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const { data: bonCommande, isLoading, isError } = useBonCommande(id)

  const columns: ColumnDef<BonCommandeLigne>[] = useMemo(
    () => [
      renderColumn({ name: 'product', label: 'Product', type: 'text' }),
      renderColumn({ name: 'quantity', label: 'Quantity', type: 'number' }),
      renderColumn({ name: 'unit_price', label: 'Unit price', type: 'number' }),
      renderColumn({ name: 'discount_percent', label: 'Discount %', type: 'number' }),
      renderColumn({ name: 'tva_rate', label: 'TVA %', type: 'number' }),
    ],
    []
  )
  const { table } = useClientTable({ data: bonCommande?.lines ?? [], columns, paginated: false })

  if (isLoading) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <Loader2 className='animate-spin' />
      </Main>
    )
  }

  if (isError || !bonCommande) {
    return (
      <Main>
        <p className='text-destructive'>Bon de commande not found.</p>
      </Main>
    )
  }

  const headerFields = [CUSTOMER_FIELD, CURRENCY_FIELD].map((descriptor) =>
    renderDetailField(descriptor, bonCommande, { renderLink })
  )

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Bon de commande {bonCommande.id}</h2>
          <p className='text-muted-foreground'>Bon de commande details and lines.</p>
        </div>
        <div className='flex gap-2'>
          {/* The only consumer of the prefill capability in this showcase —
              passes just the id in the URL (`prefillId`), never the
              bon de commande's own data. VentesFormPage resolves
              `prefillSource: 'bon_commande'` against its own `prefill.sources`
              map and fetches the real payload itself via
              `bonsCommandeApi.customGet(...)`. */}
          <Button asChild variant='outline'>
            <Link to='/ventes/saisie' search={{ prefillSource: 'bon_commande', prefillId: bonCommande.id }}>
              Vendre
            </Link>
          </Button>
          <Button asChild variant='outline'>
            <Link to='/bons-commande/saisie/$id' params={{ id: bonCommande.id }}>
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
          <dd className='mt-0.5'>{new Date(bonCommande.created_at).toLocaleString()}</dd>
        </div>
        <div>
          <dt className='text-xs text-muted-foreground'>Updated</dt>
          <dd className='mt-0.5'>{new Date(bonCommande.updated_at).toLocaleString()}</dd>
        </div>
      </dl>

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
            {table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-16 text-center text-muted-foreground'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Main>
  )
}
