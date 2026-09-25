import { create } from 'zustand'
import { getCookie, removeCookie, setCookie } from '@/lib/cookies'

const ACCESS_TOKEN_COOKIE = 'access_token'
const REFRESH_TOKEN_COOKIE = 'refresh_token'

export interface AuthUser {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  roles: string[]
  permissions: string[]
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    refreshToken: string
    setTokens: (accessToken: string, refreshToken: string) => void
    setAccessToken: (accessToken: string) => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const initAccessToken = getCookie(ACCESS_TOKEN_COOKIE) ?? ''
  const initRefreshToken = getCookie(REFRESH_TOKEN_COOKIE) ?? ''

  return {
    auth: {
      user: null,
      setUser: (user) => set((state) => ({ auth: { ...state.auth, user } })),
      accessToken: initAccessToken,
      refreshToken: initRefreshToken,
      setTokens: (accessToken, refreshToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN_COOKIE, accessToken)
          setCookie(REFRESH_TOKEN_COOKIE, refreshToken)
          return { auth: { ...state.auth, accessToken, refreshToken } }
        }),
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN_COOKIE, accessToken)
          return { auth: { ...state.auth, accessToken } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN_COOKIE)
          removeCookie(REFRESH_TOKEN_COOKIE)
          return { auth: { ...state.auth, user: null, accessToken: '', refreshToken: '' } }
        }),
    },
  }
})

export function hasRole(role: string): boolean {
  return useAuthStore.getState().auth.user?.roles.includes(role) ?? false
}

export function hasPermission(codename: string): boolean {
  return useAuthStore.getState().auth.user?.permissions.includes(codename) ?? false
}
