import { createJwtAxiosClient, type TokenStore } from 'tanstack-pagekit/axios'
import { useAuthStore } from '@/stores/auth-store'

// What to do once the session is really over (refresh refused). Registered by
// `main.tsx` (`expireSession`): this module must not import the router, which
// imports the pages, which import this client.
let sessionExpiredHandler: () => void = () => useAuthStore.getState().auth.reset()

export function onSessionExpired(handler: () => void) {
  sessionExpiredHandler = handler
}

const tokenStore: TokenStore = {
  getAccessToken: () => useAuthStore.getState().auth.accessToken,
  getRefreshToken: () => useAuthStore.getState().auth.refreshToken,
  setAccessToken: (token: string) => useAuthStore.getState().auth.setAccessToken(token),
  // The backend rotates refresh tokens: keep the new one, or the session ends
  // when the first one expires, however active the user is.
  setRefreshToken: (token: string) => useAuthStore.getState().auth.setRefreshToken(token),
  onRefreshFailed: () => sessionExpiredHandler(),
}

export const apiClient = createJwtAxiosClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  tokens: tokenStore,
})
