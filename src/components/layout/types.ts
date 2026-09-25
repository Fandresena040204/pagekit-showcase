import { type LinkProps } from '@tanstack/react-router'

type BaseNavItem = {
  title: string
  icon?: React.ElementType
  permission?: string
  role?: string
}

export type NavLink = BaseNavItem & {
  url: LinkProps['to'] | (string & {})
  items?: never
}

export type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] | (string & {}) })[]
  url?: never
}

export type NavItem = NavCollapsible | NavLink

export type NavGroup = {
  title: string
  items: NavItem[]
}

export type SidebarData = {
  teams: { name: string; logo: React.ElementType; plan: string }[]
  navGroups: NavGroup[]
}
