import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { renderColumn, useDetailTabTable, useTanStackRouterAdapter } from 'tanstack-pagekit'
import { DataTablePagination, RenderTanstackTable } from '@/components/data-table'
import { useLivraisonsByVente } from '@/features/livraisons/resource'
import type { Livraison } from '@/features/types'

const LIVRAISON_STATUS_LABEL: Record<Livraison['status'], string> = {
  pending: 'En attente',
  shipped: 'Expédiée',
  delivered: 'Livrée',
}

/** Real server-side pagination (via useDetailTabTable), unlike the fixed `pageSize: 50` this tab used before. */
export function LivraisonsTab({ venteId }: { venteId: string }) {
  const router = useTanStackRouterAdapter()

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

  const { table, isLoading } = useDetailTabTable<Livraison>({
    router,
    tabId: 'livraisons',
    resource: { useListPage: (params) => useLivraisonsByVente(venteId, params) },
    columns,
    pagination: { defaultPageSize: 10 },
  })

  if (isLoading) return <Loader2 className='animate-spin' />
  return (
    <div className='flex flex-col gap-2'>
      <RenderTanstackTable table={table} columnCount={columns.length} />
      <DataTablePagination table={table} />
    </div>
  )
}
