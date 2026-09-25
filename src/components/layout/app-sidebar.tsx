import { hasPermission, hasRole } from '@/stores/auth-store'
import { useLayout } from '@/context/layout-provider'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { type NavGroup as NavGroupType, type NavItem } from './types'

function isNavItemVisible(item: { role?: string; permission?: string }): boolean {
  if (item.role && !hasRole(item.role)) return false
  if (item.permission && !hasPermission(item.permission)) return false
  return true
}

function getVisibleNavItem(item: NavItem): NavItem | null {
  if (!isNavItemVisible(item)) return null
  if (!item.items) return item
  const visibleSubItems = item.items.filter(isNavItemVisible)
  if (visibleSubItems.length === 0) return null
  return { ...item, items: visibleSubItems }
}

function getVisibleNavGroups(navGroups: NavGroupType[]): NavGroupType[] {
  return navGroups
    .map((group) => ({ ...group, items: group.items.map(getVisibleNavItem).filter((i) => i !== null) }))
    .filter((group) => group.items.length > 0)
}

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const navGroups = getVisibleNavGroups(sidebarData.navGroups)
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
