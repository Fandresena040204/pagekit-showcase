import { queryClient } from './query-client'
import { useAuthStore } from '@/stores/auth-store'

/** `redirect` comes from the URL: only follow it inside the app (`/x`, not `//evil.com`). */
export function safeRedirect(value: unknown): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

// Ten requests can fail at once when the refresh token is refused: expire once.
let expired = false

/** Called after a successful sign-in, so the next expiry is handled again. */
export function rearmSessionExpiry() {
  expired = false
}

type Navigator = {
  navigate: (opts: { to: '/sign-in'; search: { redirect: string; reason: 'expired' }; replace: true }) => unknown
}

/**
 * The session is over (refresh refused): forget everything this user loaded,
 * then send them to sign-in, back to this exact page afterwards. `router` is
 * passed in by `main.tsx` rather than imported (the router imports the pages,
 * which import the API client that triggers this).
 */
export function expireSession(router: Navigator) {
  if (expired) return
  expired = true
  queryClient.clear()
  useAuthStore.getState().auth.reset()
  const redirect = safeRedirect(window.location.pathname + window.location.search)
  router.navigate({ to: '/sign-in', search: { redirect, reason: 'expired' }, replace: true })
}
