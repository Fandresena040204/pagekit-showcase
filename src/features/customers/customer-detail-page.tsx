import { ApiErrorState } from '@/components/errors/api-error-state'
import { Link, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { renderDetailField } from 'tanstack-pagekit'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { useCustomer } from './resource'
import { ACTIVE_FIELD, CITY_FIELD, EMAIL_FIELD, PHONE_FIELD } from './fields'

/** Reuses the SAME `FieldDescriptor`s as the list columns (`fields.tsx`) via `renderDetailField` instead of `renderColumn`. */
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
        <ApiErrorState />
      </Main>
    )
  }

  const fields = [EMAIL_FIELD, PHONE_FIELD, CITY_FIELD].map((descriptor) => renderDetailField(descriptor, customer))

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>{customer.name}</h2>
          <p className='text-muted-foreground'>{customer.id}</p>
        </div>
        <div className='flex items-center gap-2'>
          {renderDetailField(ACTIVE_FIELD, customer).value as React.ReactNode}
          <Button asChild variant='outline'>
            <Link to='/customers/saisie/$id' params={{ id: customer.id }}>
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <dl className='grid grid-cols-2 gap-x-6 gap-y-3 rounded-md border p-4 sm:grid-cols-4'>
        {fields.map((field) => (
          <div key={field.label}>
            <dt className='text-xs text-muted-foreground'>{field.label}</dt>
            <dd className='mt-0.5'>{field.value as React.ReactNode}</dd>
          </div>
        ))}
        <div>
          <dt className='text-xs text-muted-foreground'>Address</dt>
          <dd className='mt-0.5'>{customer.address || '—'}</dd>
        </div>
        <div>
          <dt className='text-xs text-muted-foreground'>Birth date</dt>
          <dd className='mt-0.5'>{customer.birth_date ? new Date(customer.birth_date).toLocaleDateString() : '—'}</dd>
        </div>
      </dl>
    </Main>
  )
}
