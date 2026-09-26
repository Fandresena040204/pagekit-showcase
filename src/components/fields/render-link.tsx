import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import type { LinkRenderer } from 'tanstack-pagekit'

/**
 * Shared implementation of tanstack-pagekit's `LinkRenderer` — injected into
 * `renderColumn`/`renderDetailField` wherever a `FieldDescriptor` is
 * `clickable`. Kept in the app (not the lib) since it imports
 * `@tanstack/react-router`'s `<Link>`, but factored into one place instead
 * of being redefined per feature — every clickable field gets the exact
 * same "this is a link" affordance (color + underline on hover), matching
 * shadcn/ui's own `buttonVariants({ variant: 'link' })` styling so it reads
 * as a link the same way a `<Button variant='link'>` would.
 */
export const renderLink: LinkRenderer = ({ to, params, children }) => (
  <Link
    to={to}
    params={params}
    className={cn('font-medium text-primary underline-offset-4 hover:underline')}
  >
    {children as React.ReactNode}
  </Link>
)
