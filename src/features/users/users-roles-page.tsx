import { ApiErrorState } from '@/components/errors/api-error-state'
import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Main } from '@/components/layout/main'
import { useRoles } from '@/features/roles/resource'
import { useSetUserRoles, useUser } from './resource'

/** Same shell as roles-form-page.tsx: a draft in local state, one Enregistrer/Annuler pair, one backend write on save. */
export function UsersRolesPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const navigate = useNavigate()
  const { data: user, isLoading, isError } = useUser(id)
  const { data: roles, isLoading: rolesLoading } = useRoles()
  const setRoles = useSetUserRoles()
  const [draft, setDraft] = useState<string[] | null>(null)

  if (isLoading || rolesLoading) {
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

  const selected = draft ?? user.roles

  function toggle(roleName: string, checked: boolean) {
    const current = draft ?? user!.roles
    setDraft(checked ? [...current, roleName] : current.filter((r) => r !== roleName))
  }

  async function save() {
    await setRoles.mutateAsync({ id, roles: selected })
    navigate({ to: '/users' })
  }

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Roles de {user.username}</h2>
        <p className='text-muted-foreground'>Cochez les rôles de cet utilisateur, puis enregistrez.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
        className='w-full space-y-4'
      >
        <div className='grid grid-cols-1 gap-3 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-3'>
          {(roles ?? []).map((role) => (
            <div key={role.id} className='flex items-center gap-2'>
              <Checkbox
                id={`role-${role.id}`}
                checked={selected.includes(role.name)}
                onCheckedChange={(checked) => toggle(role.name, checked === true)}
              />
              <Label htmlFor={`role-${role.id}`} className='capitalize'>
                {role.name}
              </Label>
            </div>
          ))}
        </div>

        <div className='flex justify-end gap-2 pt-2'>
          <Button type='button' variant='outline' onClick={() => navigate({ to: '/users' })}>
            Annuler
          </Button>
          <Button type='submit' disabled={setRoles.isPending}>
            {setRoles.isPending && <Loader2 className='animate-spin' />}
            Enregistrer
          </Button>
        </div>
      </form>
    </Main>
  )
}
