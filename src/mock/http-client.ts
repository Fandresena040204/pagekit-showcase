import type { HttpClient } from 'tanstack-pagekit'
import type { Customer, Product, Vente } from '@/features/types'
import { customers as seedCustomers, products as seedProducts, ventes as seedVentes } from './data'
import { createMockStore, type PaginatedResponse } from './store'

const customerStore = createMockStore<Customer>({
  seed: seedCustomers,
  searchIn: (c) => [c.name, c.email],
})

const productStore = createMockStore<Product>({
  seed: seedProducts,
  searchIn: (p) => [p.name, p.sku],
})

const venteStore = createMockStore<Vente>({
  seed: seedVentes,
  searchIn: (v) => [v.id, v.customer],
  filterableFields: ['status'],
})

type Store<T extends { id: string }> = ReturnType<typeof createMockStore<T>>

const RESOURCES: Record<string, Store<Customer> | Store<Product> | Store<Vente>> = {
  '/api/customers/': customerStore,
  '/api/products/': productStore,
  '/api/ventes/': venteStore,
}

function resolveResource(path: string) {
  for (const [prefix, store] of Object.entries(RESOURCES)) {
    if (path === prefix) return { store, id: undefined as string | undefined, prefix }
    if (path.startsWith(prefix)) {
      const rest = path.slice(prefix.length).replace(/\/$/, '')
      if (rest && !rest.includes('/')) return { store, id: rest, prefix }
    }
  }
  return null
}

function parseUrl(url: string): { path: string; query: Record<string, string> } {
  const [path, qs] = url.split('?')
  const query: Record<string, string> = {}
  if (qs) {
    for (const [k, v] of new URLSearchParams(qs)) query[k] = v
  }
  return { path, query }
}

// The real Django backend computes `status` (defaults to 'draft') and
// `total` (sum of lines) server-side; the mock does the same so
// create/update round-trips look right in the UI without a real backend.
function withVenteDefaults(body: unknown): unknown {
  const payload = body as { customer: string; lines: { id?: string; product: string; quantity: string; unit_price: string }[]; status?: string }
  const lines = (payload.lines ?? []).map((line, i) => ({ ...line, id: line.id ?? `ln-new-${i}` }))
  const total = lines.reduce((sum, l) => sum + Number(l.quantity) * Number(l.unit_price), 0)
  return { ...payload, status: payload.status ?? 'draft', lines, total: total.toFixed(2) }
}

function cleanParams(params: Record<string, unknown>): Record<string, string> {
  const clean: Record<string, string> = {}
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    clean[k] = String(v)
  }
  return clean
}

/** Simulated network latency, so loading states are visible like against a real backend. */
function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/**
 * Implements `tanstack-pagekit`'s `HttpClient` contract in memory, so the
 * showcase runs end-to-end without a real Django backend. Response shapes
 * (`PaginatedResponse`, query params `page`/`page_size`/`search`/filters)
 * match exactly what `createResourceApi` sends and expects.
 */
export const mockHttpClient: HttpClient = {
  async get<T>(url: string, opts?: { params?: Record<string, unknown> }) {
    const { path, query: urlQuery } = parseUrl(url)
    const resolved = resolveResource(path)
    if (!resolved) throw new Error(`Mock http: unknown GET ${url}`)
    const { store, id, prefix } = resolved

    if (id) {
      return delay({ data: store.get(id) as T })
    }

    const params = { ...urlQuery, ...(opts?.params as Record<string, unknown>) }
    const page = Number(params.page ?? 1)
    const pageSize = Number(params.page_size ?? 10)
    const pageResult = store.list({ ...params, page, page_size: pageSize })
    const hasNext = page * pageSize < pageResult.count
    const response: PaginatedResponse<unknown> = {
      count: pageResult.count,
      next: hasNext
        ? `${prefix}?${new URLSearchParams({ ...cleanParams(params), page: String(page + 1), page_size: String(pageSize) }).toString()}`
        : null,
      previous: page > 1
        ? `${prefix}?${new URLSearchParams({ ...cleanParams(params), page: String(page - 1), page_size: String(pageSize) }).toString()}`
        : null,
      results: pageResult.results,
    }
    return delay({ data: response as T })
  },

  async post<T>(url: string, body: unknown) {
    const resolved = resolveResource(parseUrl(url).path)
    if (!resolved) throw new Error(`Mock http: unknown POST ${url}`)
    const payload = resolved.prefix === '/api/ventes/' ? withVenteDefaults(body) : body
    const created = resolved.store.create(payload as never)
    return delay({ data: created as T })
  },

  async patch<T>(url: string, body: unknown) {
    const resolved = resolveResource(parseUrl(url).path)
    if (!resolved?.id) throw new Error(`Mock http: unknown PATCH ${url}`)
    const payload = resolved.prefix === '/api/ventes/' ? withVenteDefaults(body) : body
    const updated = resolved.store.update(resolved.id, payload as never)
    return delay({ data: updated as T })
  },

  async delete(url: string) {
    const resolved = resolveResource(parseUrl(url).path)
    if (!resolved?.id) throw new Error(`Mock http: unknown DELETE ${url}`)
    resolved.store.remove(resolved.id)
    return delay(undefined)
  },
}
