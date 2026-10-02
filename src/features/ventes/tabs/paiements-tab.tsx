import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { renderColumn, useDetailTabTable, useTanStackRouterAdapter } from 'tanstack-pagekit'
import { DataTablePagination, RenderTanstackTable } from '@/components/data-table'
import { usePaiementsByVente } from '@/features/paiements/resource'
import type { Paiement } from '@/features/types'

const PAIEMENT_METHOD_LABEL: Record<Paiement['method'], string> = {
  cash: 'Espèces',
  card: 'Carte',
  transfer: 'Virement',
}

/** Real server-side pagination (via useDetailTabTable), unlike the fixed `pageSize: 50` this tab used before. */
export function PaiementsTab({ venteId }: { venteId: string }) {
  const router = useTanStackRouterAdapter()

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

  const { table, isLoading } = useDetailTabTable<Paiement>({
    router,
    tabId: 'paiements',
    resource: { useListPage: (params) => usePaiementsByVente(venteId, params) },
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
