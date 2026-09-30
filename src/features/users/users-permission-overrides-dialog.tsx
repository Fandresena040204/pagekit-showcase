import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { User } from '@/features/types'
import { PermissionOverrideMatrix } from './permission-override-matrix'
import { useClearPermissionOverride, useSetPermissionOverride, useUser } from './resource'

type UsersPermissionOverridesDialogProps = {
  user: User | null
  onOpenChange: (open: boolean) => void
}

/**
 * Same idiom as UsersRolesDialog: each cell click calls the backend
 * immediately (set_permission_override/clear_permission_override), no
 * separate "Save" button, and re-fetches the user (useUser) so the matrix
 * always reflects the backend's current state.
 */
export function UsersPermissionOverridesDialog({ user, onOpenChange }: UsersPermissionOverridesDialogProps) {
  const setOverride = useSetPermissionOverride()
  const clearOverride = useClearPermissionOverride()
  const [pending, setPending] = useState<string | null>(null)
  const { data: liveUser } = useUser(user?.id ?? '', { enabled: !!user })

  if (!user) return null
  const overrides = liveUser?.permission_overrides ?? user.permission_overrides ?? []

  async function setPermissionOverride(codename: string, isAllowed: boolean) {
    if (!user) return
    setPending(codename)
    try {
      await setOverride.mutateAsync({ id: user.id, permission: codename, is_allowed: isAllowed })
    } finally {
      setPending(null)
    }
  }

  async function clearPermissionOverride(codename: string) {
    if (!user) return
    setPending(codename)
    try {
      await clearOverride.mutateAsync({ id: user.id, permission: codename })
    } finally {
      setPending(null)
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Permission overrides for {user.username}</DialogTitle>
          <DialogDescription>
            Hérité follows the user's roles. Autorisé/Refusé overrides a role's decision for this user only — each
            click applies immediately.
          </DialogDescription>
        </DialogHeader>
        <PermissionOverrideMatrix
          value={overrides}
          onSetOverride={setPermissionOverride}
          onClearOverride={clearPermissionOverride}
          pending={pending}
        />
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
