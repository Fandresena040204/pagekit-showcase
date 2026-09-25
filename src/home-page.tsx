import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'

export function HomePage() {
  return (
    <Main className='flex flex-1 flex-col items-start gap-4'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Pagekit Showcase</h1>
        <p className='max-w-xl text-muted-foreground'>
          The Ventes feature of poc-vente-front, rebuilt on{' '}
          <code className='rounded bg-muted px-1'>tanstack-pagekit</code> — same visual interface, list/detail/form
          logic driven by the library instead of hand-written per page.
        </p>
      </div>
      <Button asChild>
        <Link to='/ventes'>Open Ventes</Link>
      </Button>
    </Main>
  )
}
