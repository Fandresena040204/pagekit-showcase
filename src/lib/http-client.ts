import type { HttpClient } from 'tanstack-pagekit'
import { apiClient } from './api-client'

/**
 * Implements tanstack-pagekit's `HttpClient` contract on top of the real
 * axios client (JWT auth + refresh, same as poc-vente-front's
 * `apiClient`). Replaces `mock/http-client.ts` now that a real Django
 * backend (`poc-django-tanstack`) is available.
 */
export const httpClient: HttpClient = {
  get: (url, opts) => apiClient.get(url, opts),
  post: (url, body) => apiClient.post(url, body),
  patch: (url, body) => apiClient.patch(url, body),
  delete: (url) => apiClient.delete(url),
}
