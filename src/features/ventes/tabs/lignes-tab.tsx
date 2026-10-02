import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { renderColumn, useClientTable } from 'tanstack-pagekit'
import { RenderTanstackTable } from '@/components/data-table'
import type { VenteLigne } from '@/features/types'

/**
 * Stays on `useClientTable` — unlike Livraisons/Paiements, there's no
 * separate server endpoint to paginate here: the lines arrive already
 * nested inside the `Vente` entity (`entity.lines`).
 */
export function LignesTab({ lines }: { lines: VenteLigne[] }) {
  // `product_name`/`product_sku` are resolved server-side
  // (VenteLigneSerializer) — no separate product fetch/lookup needed.
  const columns: ColumnDef<VenteLigne>[] = useMemo(
    () => [
      renderColumn({
        name: 'product_name',
        label: 'Product',
        type: 'text',
        render: (row) => `${row.product_name} (${row.product_sku})`,
      }),
      renderColumn({ name: 'quantity', label: 'Quantity', type: 'number' }),
      renderColumn({ name: 'unit_price', label: 'Unit price', type: 'number' }),
    ],
    []
  )

  const { table } = useClientTable({ data: lines, columns, paginated: false })

  return <RenderTanstackTable table={table} columnCount={columns.length} />
}
