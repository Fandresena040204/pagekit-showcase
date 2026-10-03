import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import type { PermissionOverride } from '@/features/types'
import { PermissionOverrideMatrix } from './permission-override-matrix'
import { useSetPermissionOverrides, useUser } from './resource'

/** Same shell as roles-form-page.tsx: the matrix edits a local draft, Enregistrer sends the whole set in one request. */
export function UsersPermissionsPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const navigate = useNavigate()
  const { data: user, isLoading, isError } = useUser(id)
  const setOverrides = useSetPermissionOverrides()
  const [draft, setDraft] = useState<PermissionOverride[] | null>(null)

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
        <p className='text-destructive'>User not found.</p>
      </Main>
    )
  }

  const current = draft ?? user.permission_overrides ?? []

  async function save() {
    await setOverrides.mutateAsync({
      id,
      overrides: current.map((o) => ({ permission: o.permission, is_allowed: o.is_allowed })),
    })
    navigate({ to: '/users' })
  }

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Permissions de {user.username}</h2>
        <p className='text-muted-foreground'>
          Hérité suit les rôles de l&apos;utilisateur. Autorisé ou Refusé remplace la décision du rôle pour cet
          utilisateur seulement. Rien n&apos;est appliqué avant Enregistrer.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
        className='w-full space-y-4'
      >
        <PermissionOverrideMatrix value={current} onChange={setDraft} />

        <div className='flex justify-end gap-2 pt-2'>
          <Button type='button' variant='outline' onClick={() => navigate({ to: '/users' })}>
            Annuler
          </Button>
          <Button type='submit' disabled={setOverrides.isPending}>
            {setOverrides.isPending && <Loader2 className='animate-spin' />}
            Enregistrer
          </Button>
        </div>
      </form>
    </Main>
  )
}
