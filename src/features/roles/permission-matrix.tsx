import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Fixed to the models actually seeded with role permissions in
// poc-django-tanstack (see apps/accounts/migrations/0006_seed_role_permissions.py
// and 0008_seed_more_role_permissions.py) — HasRolePermission checks
// `{action}_{model}` codenames against exactly these.
const MODELS = [
  { label: 'Customer', value: 'customer' },
  { label: 'Product', value: 'product' },
  { label: 'Product category', value: 'productcategory' },
  { label: 'Vente', value: 'vente' },
  { label: 'Livraison', value: 'livraison' },
  { label: 'Paiement', value: 'paiement' },
] as const

const ACTIONS = ['view', 'add', 'change', 'delete'] as const

type PermissionMatrixProps = {
  value: string[]
  onChange: (next: string[]) => void
}

/**
 * Ported from poc-vente-front's `roles-permission-matrix.tsx`: one row per
 * model, one checkbox column per action, codename = `${action}_${model}`
 * (Django's default `auth.Permission` naming, matched by
 * `HasRolePermission` on the backend).
 */
export function PermissionMatrix({ value, onChange }: PermissionMatrixProps) {
  function toggle(codename: string, checked: boolean) {
    onChange(checked ? [...value, codename] : value.filter((c) => c !== codename))
  }

  return (
    <div className='overflow-hidden rounded-md border'>
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
          {MODELS.map((model) => (
            <TableRow key={model.value}>
              <TableCell>{model.label}</TableCell>
              {ACTIONS.map((action) => {
                const codename = `${action}_${model.value}`
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
    </div>
  )
}
