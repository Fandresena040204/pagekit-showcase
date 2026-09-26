import { Outlet, createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { Toaster } from '@/components/ui/sonner'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { fetchMe } from '@/features/auth/api'
import { SignInPage } from '@/features/auth/sign-in-page'
import { HomePage } from './home-page'
import { CustomerDetailPage } from '@/features/customers/customer-detail-page'
import { CustomersFormPage } from '@/features/customers/customers-form-page'
import { CustomersListPage } from '@/features/customers/customers-list-page'
import { ProductsDetailPage } from '@/features/products/products-detail-page'
import { ProductsFormPage } from '@/features/products/products-form-page'
import { ProductsListPage } from '@/features/products/products-list-page'
import { RolesDetailPage } from '@/features/roles/roles-detail-page'
import { RolesFormPage } from '@/features/roles/roles-form-page'
import { RolesListPage } from '@/features/roles/roles-list-page'
import { UsersDetailPage } from '@/features/users/users-detail-page'
import { UsersListPage } from '@/features/users/users-list-page'
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

const customersListRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/customers',
  component: CustomersListPage,
  validateSearch: (search: Record<string, unknown>) => search,
})

const customersNewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/customers/saisie',
  component: CustomersFormPage,
})

const customersEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/customers/saisie/$id',
  component: CustomersFormPage,
})

const productsListRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/products',
  component: ProductsListPage,
  validateSearch: (search: Record<string, unknown>) => search,
})

const productsDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/products/$id',
  component: ProductsDetailPage,
})

const productsNewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/products/saisie',
  component: ProductsFormPage,
})

const productsEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/products/saisie/$id',
  component: ProductsFormPage,
})

const rolesListRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/roles',
  component: RolesListPage,
  validateSearch: (search: Record<string, unknown>) => search,
})

const rolesDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/roles/$id',
  component: RolesDetailPage,
})

const rolesNewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/roles/saisie',
  component: RolesFormPage,
})

const rolesEditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/roles/saisie/$id',
  component: RolesFormPage,
})

const usersListRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/users',
  component: UsersListPage,
  validateSearch: (search: Record<string, unknown>) => search,
})

const usersDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/users/$id',
  component: UsersDetailPage,
})

const routeTree = rootRoute.addChildren([
  signInRoute,
  authenticatedRoute.addChildren([
    homeRoute,
    ventesListRoute,
    ventesNewRoute,
    ventesEditRoute,
    ventesDetailRoute,
    customersListRoute,
    customersNewRoute,
    customersEditRoute,
    customerDetailRoute,
    productsListRoute,
    productsNewRoute,
    productsEditRoute,
    productsDetailRoute,
    rolesListRoute,
    rolesNewRoute,
    rolesEditRoute,
    rolesDetailRoute,
    usersListRoute,
    usersDetailRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
