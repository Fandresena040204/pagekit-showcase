export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

type ListQuery = {
  page?: number
  page_size?: number
  ordering?: string
  search?: string
  [key: string]: unknown
}

/**
 * In-memory stand-in for a Django REST Framework resource endpoint: same
 * paginated shape (`count`/`next`/`previous`/`results`), same query params
 * (`page`, `page_size`, `search`, resource-specific filters) as
 * `createResourceApi`'s `fetchList` sends. Lets the showcase run end-to-end
 * without a real backend while keeping the exact same `HttpClient` contract.
 */
export function createMockStore<T extends { id: string }>(options: {
  seed: T[]
  searchIn?: (item: T) => string[]
  /** Extra query params matched against a field of the same name (e.g. `status` -> comma-separated values). */
  filterableFields?: (keyof T)[]
}) {
  let items = [...options.seed]

  function list(query: ListQuery): PaginatedResponse<T> {
    let filtered = items

    if (query.search) {
      const needle = String(query.search).toLowerCase()
      filtered = filtered.filter((item) =>
        (options.searchIn?.(item) ?? []).some((v) => v.toLowerCase().includes(needle))
      )
    }

    for (const field of options.filterableFields ?? []) {
      const raw = query[field as string]
      if (raw === undefined || raw === '') continue
      const values = String(raw).split(',')
      filtered = filtered.filter((item) => values.includes(String(item[field])))
    }

    const page = Number(query.page ?? 1)
    const pageSize = Number(query.page_size ?? 10)
    const start = (page - 1) * pageSize
    const pageItems = filtered.slice(start, start + pageSize)

    return {
      count: filtered.length,
      next: start + pageSize < filtered.length ? 'has-more' : null,
      previous: page > 1 ? 'has-previous' : null,
      results: pageItems,
    }
  }

  function listAll(): T[] {
    return items
  }

  function get(id: string): T {
    const found = items.find((item) => item.id === id)
    if (!found) throw new Error(`Not found: ${id}`)
    return found
  }

  function create(payload: Omit<T, 'id'> & { id?: string }): T {
    const id = payload.id ?? `${Date.now()}-${Math.round(Math.random() * 1000)}`
    const created = { ...payload, id } as T
    items = [created, ...items]
    return created
  }

  function update(id: string, payload: Partial<T>): T {
    const existing = get(id)
    const updated = { ...existing, ...payload, id }
    items = items.map((item) => (item.id === id ? updated : item))
    return updated
  }

  function remove(id: string): void {
    items = items.filter((item) => item.id !== id)
  }

  return { list, listAll, get, create, update, remove }
}
