import { useMemo, useState } from 'react'
import { Check, ChevronDown, Loader2, Minus, X } from 'lucide-react'
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
// du rôle, pas d'exception" (voir la doc de clear_permission_override côté
// backend) — un Checkbox à 2 états ne peut pas représenter ça.
const NEXT: Record<OverrideState, OverrideState> = {
  inherited: 'allowed',
  allowed: 'denied',
  denied: 'inherited',
}

const STATE_ICON: Record<OverrideState, typeof Check> = {
  inherited: Minus,
  allowed: Check,
  denied: X,
}

const STATE_STYLE: Record<OverrideState, string> = {
  inherited: 'text-muted-foreground border-muted-foreground/30',
  allowed: 'text-emerald-600 border-emerald-600/40 bg-emerald-600/10',
  denied: 'text-destructive border-destructive/40 bg-destructive/10',
}

type PermissionOverrideMatrixProps = {
  value: PermissionOverride[]
  onSetOverride: (codename: string, isAllowed: boolean) => void
  onClearOverride: (codename: string) => void
  pending: string | null
}

/** Same data source and layout as roles/permission-matrix.tsx (shared usePermissionsList, grouped by app, searchable) — only the cell is a 3-state cycle instead of a checkbox. */
export function PermissionOverrideMatrix({ value, onSetOverride, onClearOverride, pending }: PermissionOverrideMatrixProps) {
  const { data: allGroups, isLoading, isError } = usePermissionsList()
  const [search, setSearch] = useState('')

  const byApp = useMemo(() => groupByApp(filterPermissionGroups(allGroups ?? [], search)), [allGroups, search])

  function cycle(codename: string) {
    const next = NEXT[stateOf(value, codename)]
    if (next === 'inherited') onClearOverride(codename)
    else onSetOverride(codename, next === 'allowed')
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center rounded-md border p-8'>
        <Loader2 className='animate-spin' />
      </div>
    )
  }

  if (isError) {
    return <p className='text-destructive'>Failed to load permissions.</p>
  }

  return (
    <div className='space-y-3'>
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
                      const Icon = STATE_ICON[state]
                      return (
                        <TableCell key={action} className='text-center'>
                          <button
                            type='button'
                            aria-label={`${codename}: ${state}, click to cycle`}
                            disabled={pending === codename}
                            onClick={() => cycle(codename)}
                            className={cn(
                              'inline-flex size-7 items-center justify-center rounded-full border transition-colors disabled:opacity-50',
                              STATE_STYLE[state]
                            )}
                          >
                            {pending === codename ? <Loader2 className='size-3.5 animate-spin' /> : <Icon className='size-3.5' />}
                          </button>
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
