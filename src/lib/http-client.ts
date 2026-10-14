import type { HttpClient } from 'tanstack-pagekit'
import { createAxiosHttpClient } from 'tanstack-pagekit/axios'
import { apiClient } from './api-client'

/** tanstack-pagekit's `HttpClient` contract on top of this app's JWT axios client (`api-client.ts`). */
export const httpClient: HttpClient = createAxiosHttpClient(apiClient)
