import { Command, LayoutDashboard, Receipt } from 'lucide-react'
import { type SidebarData } from '../types'

/**
 * Trimmed to what this showcase actually implements (Ventes list/detail/
 * form, Customer detail) — same visual structure as poc-vente-front's
 * sidebar-data.ts, not the full resource set (Products/Users/Roles/
 * Settings aren't pages here).
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
      ],
    },
  ],
}
