import type { AuthUser } from '@/stores/auth-store'
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
