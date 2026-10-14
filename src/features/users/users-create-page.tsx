import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Main } from '@/components/layout/main'
import { PasswordInput } from '@/components/password-input'
import { useRoles } from '@/features/roles/resource'
import { useCreateUser } from './resource'
import { parseApiError } from 'tanstack-pagekit/axios'

/** Create-only, not built on `useResourceForm` : `UserViewSet` has no
 * update endpoint (list/retrieve/create — see resource.ts), so there is no
 * edit mode to share a form shape with. Same local-draft-plus-checkboxes
 * shell as users-roles-page.tsx for the roles part. */
export function UsersCreatePage() {
  const navigate = useNavigate()
  const { data: roles, isLoading: rolesLoading } = useRoles()
  const createUser = useCreateUser()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])

  function toggleRole(roleName: string, checked: boolean) {
    setSelectedRoles((current) =>
      checked ? [...current, roleName] : current.filter((r) => r !== roleName)
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors([])
    try {
      await createUser.mutateAsync({ username, email, password, roles: selectedRoles })
      navigate({ to: '/users' })
    } catch (error) {
      const parsed = parseApiError(error)
      // Flatten champs messages, or use the main message if champs is empty
      const messages = Object.values(parsed.champs).flat()
      setErrors(messages.length > 0 ? messages : [parsed.message])
    }
  }

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Nouvel utilisateur</h2>
        <p className='text-muted-foreground'>Créez un compte et attribuez-lui des rôles.</p>
      </div>

      <form onSubmit={handleSubmit} className='w-full space-y-4'>
        <div className='grid grid-cols-1 gap-4 rounded-md border p-4 sm:grid-cols-2'>
          <div className='grid gap-1.5'>
            <Label htmlFor='username'>Nom d'utilisateur</Label>
            <Input
              id='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className='grid gap-1.5 sm:col-span-2'>
            <Label htmlFor='password'>Mot de passe</Label>
            <PasswordInput
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label className='mb-2 block'>Rôles</Label>
          {rolesLoading ? (
            <Loader2 className='animate-spin' />
          ) : (
            <div className='grid grid-cols-1 gap-3 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-3'>
              {(roles ?? []).map((role) => (
                <div key={role.id} className='flex items-center gap-2'>
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={selectedRoles.includes(role.name)}
                    onCheckedChange={(checked) => toggleRole(role.name, checked === true)}
                  />
                  <Label htmlFor={`role-${role.id}`} className='capitalize'>
                    {role.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {errors.length > 0 && (
          <ul className='list-inside list-disc text-sm text-destructive'>
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <div className='flex justify-end gap-2 pt-2'>
          <Button type='button' variant='outline' onClick={() => navigate({ to: '/users' })}>
            Annuler
          </Button>
          <Button type='submit' disabled={createUser.isPending}>
            {createUser.isPending && <Loader2 className='animate-spin' />}
            Créer
          </Button>
        </div>
      </form>
    </Main>
  )
}
