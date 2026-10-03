import { isAxiosError } from 'axios'

/** HTTP status of a failed API call, or undefined when no response came back (network down). */
export function apiErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined
}

/** Client errors are final (403 never becomes 200 on retry); network and 5xx may be transient. */
export function isRetryableApiError(error: unknown): boolean {
  const status = apiErrorStatus(error)
  return status === undefined || status >= 500
}
