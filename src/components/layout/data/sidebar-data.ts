import { Command, LayoutDashboard, Package, Receipt, ShieldCheck, UserCog, Users } from 'lucide-react'
import { type SidebarData } from '../types'

/**
 * Same visual structure/grouping as poc-vente-front's sidebar-data.ts
 * ("General" for the business resources, "Administration" for Users/
 * Roles) — trimmed to what this showcase implements (no Settings/Help
 * Center/Errors pages, out of scope for the lib comparison).
 */
export const sidebarData: SidebarData = {
  teams: [{ name: 'Pagekit Showcase', logo: Command, plan: 'POC' }],
  navGroups: [
    {
      title: 'General',
      items: [
        { title: 'Dashboard', url: '/', icon: LayoutDashboard },
        {
          title: 'Ventes',
          icon: Receipt,
          items: [
            { title: 'Liste', url: '/ventes', permission: 'view_vente' },
            { title: 'Saisie', url: '/ventes/saisie', permission: 'add_vente' },
          ],
        },
        {
          title: 'Products',
          icon: Package,
          items: [
            { title: 'Liste', url: '/products', permission: 'view_product' },
            { title: 'Saisie', url: '/products/saisie', permission: 'add_product' },
          ],
        },
        {
          title: 'Customers',
          icon: Users,
          items: [
            { title: 'Liste', url: '/customers', permission: 'view_customer' },
            { title: 'Saisie', url: '/customers/saisie', permission: 'add_customer' },
          ],
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        { title: 'Users', url: '/users', icon: UserCog },
        {
          title: 'Roles',
          icon: ShieldCheck,
          items: [
            { title: 'Liste', url: '/roles' },
            { title: 'Saisie', url: '/roles/saisie' },
          ],
        },
      ],
    },
  ],
}
