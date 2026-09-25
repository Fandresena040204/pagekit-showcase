import { Link } from '@tanstack/react-router'

/**
 * Minimal stand-in for poc-vente-front's full app shell (sidebar, teams,
 * auth, theme/font/direction providers) — out of scope for this POC, whose
 * point is the Ventes list/detail/form pages themselves, not the admin
 * dashboard chrome around them. See README "Known limitations".
 */
export function Header() {
  return (
    <header className='flex items-center justify-between border-b px-4 py-3'>
      <Link to='/' className='font-semibold tracking-tight'>
        Pagekit Showcase
      </Link>
      <nav className='flex gap-4 text-sm text-muted-foreground'>
        <Link to='/ventes' className='hover:text-foreground [&.active]:text-foreground [&.active]:font-medium'>
          Ventes
        </Link>
      </nav>
    </header>
  )
}
