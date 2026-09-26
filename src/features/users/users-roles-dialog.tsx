import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRoles } from '@/features/roles/resource'
import type { User } from '@/features/types'
import { useAssignRole, useRemoveRole, useUser } from './resource'

type UsersRolesDialogProps = {
  user: User | null
  onOpenChange: (open: boolean) => void
}

/** Ported from poc-vente-front's `users-roles-dialog.tsx`: one checkbox per role, checked according to the user's current roles, each toggle immediately calls `assign_role`/`remove_role` on the backend. */
export function UsersRolesDialog({ user, onOpenChange }: UsersRolesDialogProps) {
  const { data: roles } = useRoles()
  const assignRole = useAssignRole()
  const removeRole = useRemoveRole()
  const [pending, setPending] = useState<string | null>(null)
  // Re-fetches after each assign/remove (both invalidate the `users` query
  // key) so the checkboxes reflect the backend's current state rather than
  // the snapshot passed in when the dialog opened.
  const { data: liveUser } = useUser(user?.id ?? '', { enabled: !!user })

  if (!user) return null
  const currentRoles = liveUser?.roles ?? user.roles

  async function toggle(roleName: string, checked: boolean) {
    if (!user) return
    setPending(roleName)
    try {
      if (checked) await assignRole.mutateAsync({ id: user.id, role: roleName })
      else await removeRole.mutateAsync({ id: user.id, role: roleName })
    } finally {
      setPending(null)
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Roles for {user.username}</DialogTitle>
          <DialogDescription>Toggling a role updates it immediately on the backend.</DialogDescription>
        </DialogHeader>
        <div className='space-y-2'>
          {(roles ?? []).map((role) => (
            <div key={role.id} className='flex items-center gap-2'>
              <Checkbox
                id={`role-${role.id}`}
                checked={currentRoles.includes(role.name)}
                disabled={pending === role.name}
                onCheckedChange={(checked) => toggle(role.name, checked === true)}
              />
              <Label htmlFor={`role-${role.id}`} className='capitalize'>
                {role.name}
              </Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
