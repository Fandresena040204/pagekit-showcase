import type { Customer, Product, Vente } from '@/features/types'

function iso(daysAgo: number) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

export const customers: Customer[] = [
  { id: 'cus-1', created_at: iso(40), updated_at: iso(40), name: 'ABC SARL', email: 'contact@abc.mg', phone: '034 00 000 01' },
  { id: 'cus-2', created_at: iso(35), updated_at: iso(35), name: 'Distri Plus', email: 'contact@distriplus.mg', phone: '034 00 000 02' },
  { id: 'cus-3', created_at: iso(30), updated_at: iso(30), name: 'Marché Central', email: 'contact@marchecentral.mg', phone: '034 00 000 03' },
  { id: 'cus-4', created_at: iso(20), updated_at: iso(20), name: 'Import Export SA', email: 'contact@importexport.mg', phone: '034 00 000 04' },
]

export const products: Product[] = [
  { id: 'prod-1', created_at: iso(50), updated_at: iso(50), name: 'Riz 25kg', sku: 'RIZ-25', default_price: '50000.00' },
  { id: 'prod-2', created_at: iso(48), updated_at: iso(48), name: 'Huile 5L', sku: 'HUI-05', default_price: '35000.00' },
  { id: 'prod-3', created_at: iso(45), updated_at: iso(45), name: 'Sucre 1kg', sku: 'SUC-01', default_price: '5000.00' },
  { id: 'prod-4', created_at: iso(42), updated_at: iso(42), name: 'Farine 1kg', sku: 'FAR-01', default_price: '4500.00' },
]

function total(lines: Vente['lines']): string {
  const sum = lines.reduce((acc, l) => acc + Number(l.quantity) * Number(l.unit_price), 0)
  return sum.toFixed(2)
}

const seedLines: Vente['lines'][] = [
  [{ id: 'ln-1', product: 'prod-1', quantity: '10', unit_price: '50000.00' }, { id: 'ln-2', product: 'prod-2', quantity: '5', unit_price: '35000.00' }],
  [{ id: 'ln-3', product: 'prod-3', quantity: '20', unit_price: '5000.00' }],
  [{ id: 'ln-4', product: 'prod-4', quantity: '15', unit_price: '4500.00' }, { id: 'ln-5', product: 'prod-1', quantity: '2', unit_price: '50000.00' }],
]

export const ventes: Vente[] = Array.from({ length: 23 }, (_, i) => {
  const lines = seedLines[i % seedLines.length]
  const statuses: Vente['status'][] = ['draft', 'validated', 'cancelled']
  return {
    id: `FAC-2026-${String(i + 1).padStart(5, '0')}`,
    created_at: iso(30 - i),
    updated_at: iso(30 - i),
    customer: customers[i % customers.length].id,
    status: statuses[i % statuses.length],
    total: total(lines),
    lines,
  }
})
