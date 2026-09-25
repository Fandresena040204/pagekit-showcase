import { createContext, useContext, useState } from 'react'
import { getCookie, setCookie } from '@/lib/cookies'

export type Collapsible = 'offcanvas' | 'icon' | 'none'
type Variant = 'inset' | 'sidebar' | 'floating'

const LAYOUT_COLLAPSIBLE_COOKIE_NAME = 'layout_collapsible'
const LAYOUT_VARIANT_COOKIE_NAME = 'layout_variant'
const LAYOUT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

const DEFAULT_VARIANT = 'inset'
const DEFAULT_COLLAPSIBLE = 'icon'

type LayoutContextType = {
  collapsible: Collapsible
  variant: Variant
}

const LayoutContext = createContext<LayoutContextType | null>(null)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [collapsible] = useState<Collapsible>(() => (getCookie(LAYOUT_COLLAPSIBLE_COOKIE_NAME) as Collapsible) || DEFAULT_COLLAPSIBLE)
  const [variant] = useState<Variant>(() => {
    const saved = (getCookie(LAYOUT_VARIANT_COOKIE_NAME) as Variant) || DEFAULT_VARIANT
    setCookie(LAYOUT_VARIANT_COOKIE_NAME, saved, LAYOUT_COOKIE_MAX_AGE)
    return saved
  })

  return <LayoutContext value={{ collapsible, variant }}>{children}</LayoutContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) throw new Error('useLayout must be used within a LayoutProvider')
  return context
}
