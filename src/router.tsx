import { Outlet, createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { Toaster } from '@/components/ui/sonner'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { fetchMe } from '@/features/auth/api'
import { SignInPage } from '@/features/auth/sign-in-page'
import { HomePage } from './home-page'
import { CustomerDetailPage } from '@/features/customers/customer-detail-page'
import { VentesDetailPage } from '@/features/ventes/ventes-detail-page'
import { VentesFormPage } from '@/features/ventes/ventes-form-page'
import { VentesListPage } from '@/features/ventes/ventes-list-page'

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  )
}

// Code-based router (no file-based route codegen, unlike poc-vente-front)
// — simpler for a POC scaffold, doesn't affect the resulting UI/URLs.
const rootRoute = createRootRoute({ component: RootLayout })

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  component: SignInPage,
  validateSearch: z.object({ redirect: z.string().optional() }),
})

// Same shell/guard split as poc-vente-front's `_authenticated/route.tsx`:
// one parent route renders `AuthenticatedLayout` (sidebar + header), every
// real page is a child of it, and `beforeLoad` redirects to `/sign-in`
// when there's no session yet.
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_authenticated',
  component: AuthenticatedLayout,
  beforeLoad: async ({ location }) => {
    const { accessToken, user, setUser, reset } = useAuthStore.getState().auth
    if (!accessToken) {
      throw redirect({ to: '/sign-in', search: { redirect: location.href } })
    }
    if (!user) {
      try {
        setUser(await fetchMe())
      } catch {
        reset()
        throw redirect({ to: '/sign-in', search: { redirect: location.href } })
      }
    }
  },
})

const homeRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/', component: HomePage })

const ventesListRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/ventes',
  component: VentesListPage,
  validateSearch: (search: Record<string, unknown>) => search,
})

const ventesDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/ventes/$id',
  component: VentesDetailPage,
  validateSearch: (search: Record<string, unknown>) => search,
})

const ventesNewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/ventes/saisie',
  component: VentesFormPage,
})

const ventesEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/ventes/saisie/$id',
  component: VentesFormPage,
})

const customerDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/customers/$id',
  component: CustomerDetailPage,
})

const routeTree = rootRoute.addChildren([
  signInRoute,
  authenticatedRoute.addChildren([homeRoute, ventesListRoute, ventesNewRoute, ventesEditRoute, ventesDetailRoute, customerDetailRoute]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
