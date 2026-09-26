import type { VenteLineForm } from '@/features/types'

export type VenteBreakdown = {
  subtotalHt: number
  discountAmount: number
  tvaAmount: number
  total: number
}

function toNumber(value: string | undefined): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

/** HT (hors taxe) of a single line, net of its own `discount_percent`. */
export function lineHt(line: VenteLineForm): number {
  return toNumber(line.quantity) * toNumber(line.unit_price) * (1 - toNumber(line.discount_percent) / 100)
}

/**
 * Same formula as `Vente.recalculate_total` in poc-django-tanstack
 * (apps/ventes/models/vente.py), reimplemented client-side for a live
 * preview while editing — the server recomputes it independently on save,
 * this is only ever a preview of what the server will return.
 */
export function computeVenteBreakdown(lines: VenteLineForm[], globalDiscountPercent: string): VenteBreakdown {
  const globalDiscount = toNumber(globalDiscountPercent)
  const subtotalHt = lines.reduce((sum, line) => sum + lineHt(line), 0)
  const discountAmount = (subtotalHt * globalDiscount) / 100
  const globalRatio = (100 - globalDiscount) / 100
  const tvaAmount = lines.reduce((sum, line) => sum + lineHt(line) * globalRatio * (toNumber(line.tva_rate) / 100), 0)
  const total = subtotalHt - discountAmount + tvaAmount

  return { subtotalHt, discountAmount, tvaAmount, total }
}
