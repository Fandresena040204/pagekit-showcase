import { ApiErrorState } from '@/components/errors/api-error-state'
import { useMemo, useState } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { ACTIONS, filterPermissionGroups, groupByApp, usePermissionsList } from '@/features/permissions/resource'
import type { PermissionOverride } from '@/features/types'

type OverrideState = 'inherited' | 'allowed' | 'denied'

function stateOf(overrides: PermissionOverride[], codename: string): OverrideState {
  const override = overrides.find((o) => o.permission === codename)
  if (!override) return 'inherited'
  return override.is_allowed ? 'allowed' : 'denied'
}

// Hérité -> Autorisé -> Refusé -> Hérité, jamais un simple binaire : l'état
// par défaut d'une permission n'est ni "autorisé" ni "refusé", c'est "hérité
// du rôle, pas d'exception" (voir la doc de set_permission_overrides côté
// backend) — un Checkbox à 2 états ne peut pas représenter ça.
const NEXT: Record<OverrideState, OverrideState> = {
  inherited: 'allowed',
  allowed: 'denied',
  denied: 'inherited',
}

// Same visual language as the roles matrix (a checkbox per cell), with three
// distinct looks: Hérité = empty dashed box (no explicit decision), Autorisé =
// green checked box, Refusé = empty box with a red border. The indeterminate
// checkbox state is not used: shadcn renders it with the same check icon.
const STATE_CHECKED: Record<OverrideState, boolean> = {
  inherited: false,
  allowed: true,
  denied: false,
}

const STATE_STYLE: Record<OverrideState, string> = {
  inherited: 'border-dashed border-muted-foreground/50',
  allowed: 'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600',
  denied: 'border-destructive',
}

type PermissionOverrideMatrixProps = {
  value: PermissionOverride[]
  onChange: (next: PermissionOverride[]) => void
}

/** Controlled, like roles/permission-matrix.tsx: the page owns the draft list and saves it in one request. Only the cell is a 3-state cycle instead of a checkbox. */
export function PermissionOverrideMatrix({ value, onChange }: PermissionOverrideMatrixProps) {
  const { data: allGroups, isLoading, isError } = usePermissionsList()
  const [search, setSearch] = useState('')

  const byApp = useMemo(() => groupByApp(filterPermissionGroups(allGroups ?? [], search)), [allGroups, search])

  function cycle(codename: string) {
    const next = NEXT[stateOf(value, codename)]
    const rest = value.filter((o) => o.permission !== codename)
    if (next === 'inherited') onChange(rest)
    else onChange([...rest, { permission: codename, is_allowed: next === 'allowed' }])
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center rounded-md border p-8'>
        <Loader2 className='animate-spin' />
      </div>
    )
  }

  if (isError) {
    return <ApiErrorState />
  }

  return (
    <div className='space-y-3'>
      <p className='text-muted-foreground text-xs'>
        Case vide en pointillés : hérité du rôle (aucune exception). Case verte cochée : autorisé pour cet
        utilisateur. Case vide à bordure rouge : refusé pour cet utilisateur. Un clic passe à l'état suivant.
      </p>
      <Input
        placeholder='Filter by entity...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='max-w-xs'
      />
      {[...byApp.entries()].map(([appLabel, groups]) => (
        <Collapsible key={appLabel} defaultOpen className='overflow-hidden rounded-md border'>
          <CollapsibleTrigger className='flex w-full items-center justify-between bg-muted/50 px-4 py-2 text-sm font-medium capitalize'>
            {appLabel}
            <ChevronDown className='size-4' />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  {ACTIONS.map((action) => (
                    <TableHead key={action} className='text-center capitalize'>
                      {action}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.model}>
                    <TableCell className='capitalize'>{group.model}</TableCell>
                    {ACTIONS.map((action) => {
                      const codename = `${action}_${group.model}`
                      if (!group.codenames.includes(codename)) {
                        return <TableCell key={action} />
                      }
                      const state = stateOf(value, codename)
                      return (
                        <TableCell key={action} className='text-center'>
                          <Checkbox
                            aria-label={`${codename}: ${state}`}
                            checked={STATE_CHECKED[state]}
                            onCheckedChange={() => cycle(codename)}
                            className={cn('mx-auto', STATE_STYLE[state])}
                          />
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CollapsibleContent>
        </Collapsible>
      ))}
      {byApp.size === 0 && <p className='text-muted-foreground text-sm'>No matching entity.</p>}
    </div>
  )
}
