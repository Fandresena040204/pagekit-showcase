import { ApiErrorState } from '@/components/errors/api-error-state'
import { useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Main } from '@/components/layout/main'
import { useUser } from './resource'

/**
 * Simple read-only consult page — Django's `UserViewSet` is a
 * `ReadOnlyModelViewSet` (see resource.ts), so there's no edit form to link
 * to here, unlike Products/Customers/Roles.
 */
export function UsersDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const { data: user, isLoading, isError } = useUser(id)

  if (isLoading) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <Loader2 className='animate-spin' />
      </Main>
    )
  }

  if (isError || !user) {
    return (
      <Main>
        <ApiErrorState />
      </Main>
    )
  }

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>{user.username}</h2>
        <p className='text-muted-foreground'>{user.email}</p>
      </div>

      <dl className='grid grid-cols-2 gap-x-6 gap-y-3 rounded-md border p-4 sm:grid-cols-4'>
        <div>
          <dt className='text-xs text-muted-foreground'>Username</dt>
          <dd className='mt-0.5'>{user.username}</dd>
        </div>
        <div>
          <dt className='text-xs text-muted-foreground'>Email</dt>
          <dd className='mt-0.5'>{user.email}</dd>
        </div>
        <div className='col-span-2'>
          <dt className='text-xs text-muted-foreground'>Roles</dt>
          <dd className='mt-0.5 flex flex-wrap gap-1'>
            {user.roles.length ? (
              user.roles.map((r) => (
                <Badge key={r} variant='secondary' className='capitalize'>
                  {r}
                </Badge>
              ))
            ) : (
              <span className='text-muted-foreground'>None</span>
            )}
          </dd>
        </div>
      </dl>
    </Main>
  )
}
