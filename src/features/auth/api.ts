import { useAuthStore, type AuthUser } from '@/stores/auth-store'
import { apiClient } from '@/lib/api-client'

export interface LoginPayload {
  username: string
  password: string
}

export interface TokenResponse {
  access: string
  refresh: string
}

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>('/api/token/', payload)
  return data
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/api/auth/me/')
  return data
}

let lastUserRefresh = 0

/**
 * Reloads the signed-in user (roles, permissions) — after a 403, permissions
 * may have changed since sign-in. At most once every 5 s; failures are
 * ignored (the request that got the 403 already reports it).
 */
export async function refreshCurrentUser() {
  if (Date.now() - lastUserRefresh < 5000) return
  lastUserRefresh = Date.now()
  try {
    useAuthStore.getState().auth.setUser(await fetchMe())
  } catch {
    // ignored, see above
  }
}
