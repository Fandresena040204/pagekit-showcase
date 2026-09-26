import { Link, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { useRole } from './resource'
import { PermissionMatrix } from './permission-matrix'

export function RolesDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const { data: role, isLoading, isError } = useRole(id)

  if (isLoading) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <Loader2 className='animate-spin' />
      </Main>
    )
  }

  if (isError || !role) {
    return (
      <Main>
        <p className='text-destructive'>Role not found.</p>
      </Main>
    )
  }

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight capitalize'>{role.name}</h2>
          <p className='text-muted-foreground'>{role.permissions.length} permission(s)</p>
        </div>
        <Button asChild variant='outline'>
          <Link to='/roles/saisie/$id' params={{ id: role.id }}>
            Edit
          </Link>
        </Button>
      </div>

      {/* Read-only: same matrix component as the form, just without onChange wired to anything editable. */}
      <PermissionMatrix value={role.permissions} onChange={() => {}} />
    </Main>
  )
}
