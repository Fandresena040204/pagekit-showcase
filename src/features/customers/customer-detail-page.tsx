import { Link, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { useCustomer } from './resource'

/** Minimal target page for the Ventes list/detail's clickable `customer` link — not a full CRUD page (out of scope for this showcase). */
export function CustomerDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const { data: customer, isLoading, isError } = useCustomer(id)

  if (isLoading) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <Loader2 className='animate-spin' />
      </Main>
    )
  }

  if (isError || !customer) {
    return (
      <Main>
        <p className='text-destructive'>Customer not found.</p>
      </Main>
    )
  }

  return (
    <Main className='flex flex-1 flex-col gap-4'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>{customer.name}</h2>
        <p className='text-muted-foreground'>{customer.email}</p>
      </div>
      <dl className='grid max-w-md grid-cols-2 gap-y-2 rounded-md border p-4 text-sm'>
        <dt className='text-muted-foreground'>Phone</dt>
        <dd>{customer.phone}</dd>
        <dt className='text-muted-foreground'>Created</dt>
        <dd>{new Date(customer.created_at).toLocaleDateString()}</dd>
      </dl>
      <Button asChild variant='outline' className='w-fit'>
        <Link to='/ventes'>Back to Ventes</Link>
      </Button>
    </Main>
  )
}
