import { createJwtAxiosClient, type TokenStore } from 'tanstack-pagekit/axios'
import { useAuthStore } from '@/stores/auth-store'

const tokenStore: TokenStore = {
  getAccessToken: () => useAuthStore.getState().auth.accessToken,
  getRefreshToken: () => useAuthStore.getState().auth.refreshToken,
  setAccessToken: (token: string) => useAuthStore.getState().auth.setAccessToken(token),
  onRefreshFailed: () => useAuthStore.getState().auth.reset(),
}

export const apiClient = createJwtAxiosClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  tokens: tokenStore,
})