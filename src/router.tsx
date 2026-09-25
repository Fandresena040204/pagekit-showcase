import { Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/layout/header'
import { HomePage } from './home-page'
import { CustomerDetailPage } from '@/features/customers/customer-detail-page'
import { VentesDetailPage } from '@/features/ventes/ventes-detail-page'
import { VentesFormPage } from '@/features/ventes/ventes-form-page'
import { VentesListPage } from '@/features/ventes/ventes-list-page'

function RootLayout() {
  return (
    <div className='flex min-h-svh flex-col'>
      <Header />
      <Outlet />
      <Toaster />
    </div>
  )
}

// Code-based router (no file-based route codegen, unlike poc-vente-front)
// — simpler for a POC scaffold, doesn't affect the resulting UI/URLs.
const rootRoute = createRootRoute({ component: RootLayout })

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage })

const ventesListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ventes',
  component: VentesListPage,
  validateSearch: (search: Record<string, unknown>) => search,
})

const ventesDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ventes/$id',
  component: VentesDetailPage,
  validateSearch: (search: Record<string, unknown>) => search,
})

const ventesNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ventes/saisie',
  component: VentesFormPage,
})

const ventesEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ventes/saisie/$id',
  component: VentesFormPage,
})

const customerDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customers/$id',
  component: CustomerDetailPage,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  ventesListRoute,
  ventesNewRoute,
  ventesEditRoute,
  ventesDetailRoute,
  customerDetailRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
