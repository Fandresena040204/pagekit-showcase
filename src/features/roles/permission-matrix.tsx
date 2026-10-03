import { ApiErrorState } from '@/components/errors/api-error-state'
import { useMemo, useState } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ACTIONS, filterPermissionGroups, groupByApp, usePermissionsList } from '@/features/permissions/resource'

type PermissionMatrixProps = {
  value: string[]
  onChange: (next: string[]) => void
}

/**
 * Rows come from /api/permissions/ (usePermissionsList) instead of a
 * hardcoded model list — a new entity appears here automatically as soon as
 * its migration has run (the backend's create_custom_permissions signal
 * seeds its 4 permissions), nothing to edit in this file. Grouped by
 * app_label (collapsible sections) and filtered by a search box, since a
 * flat table stops being usable once the entity count grows.
 */
export function PermissionMatrix({ value, onChange }: PermissionMatrixProps) {
  const { data: allGroups, isLoading, isError } = usePermissionsList()
  const [search, setSearch] = useState('')

  const byApp = useMemo(() => groupByApp(filterPermissionGroups(allGroups ?? [], search)), [allGroups, search])

  function toggle(codename: string, checked: boolean) {
    onChange(checked ? [...value, codename] : value.filter((c) => c !== codename))
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
                      return (
                        <TableCell key={action} className='text-center'>
                          <Checkbox
                            checked={value.includes(codename)}
                            onCheckedChange={(checked) => toggle(codename, checked === true)}
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
