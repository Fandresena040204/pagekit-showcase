import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCookie, removeCookie, setCookie } from '@/lib/cookies'

type Theme = 'dark' | 'light' | 'system'
type ResolvedTheme = Exclude<Theme, 'system'>

const DEFAULT_THEME = 'system'
const THEME_COOKIE_NAME = 'vite-ui-theme'
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

type ThemeProviderState = {
  resolvedTheme: ResolvedTheme
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  resolvedTheme: 'light',
  theme: DEFAULT_THEME,
  setTheme: () => null,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, _setTheme] = useState<Theme>(() => (getCookie(THEME_COOKIE_NAME) as Theme) || DEFAULT_THEME)

  const resolvedTheme = useMemo((): ResolvedTheme => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = (current: ResolvedTheme) => {
      root.classList.remove('light', 'dark')
      root.classList.add(current)
    }

    const handleChange = () => {
      if (theme === 'system') applyTheme(mediaQuery.matches ? 'dark' : 'light')
    }

    applyTheme(resolvedTheme)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, resolvedTheme])

  const setTheme = (next: Theme) => {
    if (next === DEFAULT_THEME) removeCookie(THEME_COOKIE_NAME)
    else setCookie(THEME_COOKIE_NAME, next, THEME_COOKIE_MAX_AGE)
    _setTheme(next)
  }

  return <ThemeContext value={{ resolvedTheme, theme, setTheme }}>{children}</ThemeContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext)
