import axios, { type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState().auth
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const { refreshToken } = useAuthStore.getState().auth
  if (!refreshToken) throw new Error('No refresh token available')

  const response = await axios.post<{ access: string }>(`${import.meta.env.VITE_API_BASE_URL}/api/token/refresh/`, {
    refresh: refreshToken,
  })
  useAuthStore.getState().auth.setAccessToken(response.data.access)
  return response.data.access
}

const AUTH_ENDPOINTS = ['/api/token/', '/api/token/refresh/', '/api/auth/register/']

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) => originalRequest?.url?.includes(endpoint))

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const newAccessToken = await refreshPromise
        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`)
        return apiClient(originalRequest)
      } catch {
        useAuthStore.getState().auth.reset()
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)
