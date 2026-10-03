import type { PrefillOptions } from 'tanstack-pagekit'
import { httpClient } from '@/lib/http-client'

/**
 * Prefill source for a document transformation (e.g. bon de commande -> vente):
 * calls `GET {endpoint}{id}/{action}/`, the dedicated backend action that
 * returns the target's form-shaped payload. No per-entity resource file needed.
 */
export function transformationSource<TForm>(
  endpoint: string,
  action: string
): PrefillOptions<TForm>['sources'][string] {
  return (id: string) => httpClient.get<Partial<TForm>>(`${endpoint}${id}/${action}/`).then((r) => r.data)
}
