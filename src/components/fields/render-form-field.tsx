import { cn } from '@/lib/utils'
import { useFieldOptions, type FieldDescriptor } from 'tanstack-pagekit'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectCombobox } from './select-combobox'

const HTML_INPUT_TYPE: Record<string, string> = { date: 'date', datetime: 'datetime-local' }

type RenderFormFieldProps<TValues> = {
  descriptor: FieldDescriptor<TValues>
  // TanStack Form's own form object type carries ~12 generic params
  // (validators for mount/change/blur/submit...) that a reusable field
  // component can't reasonably restate — TanStack Form's own docs use `any`
  // for this exact situation (see `AnyFieldApi` in their examples).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  hideLabel?: boolean
  className?: string
}

/**
 * Port of poc-vente-front's `render-form-field.tsx` onto TanStack Form:
 * same responsibility (branch a `FieldDescriptor` onto the form, handle
 * selects/autocomplete/cascades via `useFieldOptions`), but `form.Field`
 * render props instead of react-hook-form's `FormField`/`Controller`. Kept
 * in the app (not in the `tanstack-pagekit` core) since it depends on
 * shadcn/ui — exactly like `resource-data-table.tsx` stays app-side for
 * the list.
 */
export function RenderFormField<TValues>({ descriptor, form, hideLabel, className }: RenderFormFieldProps<TValues>) {
  const { options, isLoadingOptions, handleSelect, onSearchChange } = useFieldOptions(descriptor, form)

  return (
    <form.Field name={descriptor.name}>
      {(field: {
        state: { value: unknown; meta: { errors: unknown[] } }
        handleChange: (value: unknown) => void
      }) => (
        <div className={cn('space-y-1', className)}>
          {!hideLabel && <Label>{descriptor.label}</Label>}
          {descriptor.type === 'select' ? (
            <SelectCombobox
              value={field.state.value as string | undefined}
              onSelect={(option) => handleSelect(option, (v) => field.handleChange(v))}
              options={options}
              isLoading={isLoadingOptions}
              placeholder={descriptor.placeholder}
              onSearchChange={onSearchChange}
            />
          ) : (
            <Input
              type={HTML_INPUT_TYPE[descriptor.type] ?? 'text'}
              inputMode={descriptor.type === 'number' ? 'decimal' : undefined}
              placeholder={descriptor.placeholder}
              autoComplete={descriptor.autoComplete}
              value={(field.state.value as string | number | undefined) ?? ''}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
          {field.state.meta.errors.length > 0 && (
            <p className='text-xs text-destructive'>{String(field.state.meta.errors[0])}</p>
          )}
        </div>
      )}
    </form.Field>
  )
}
