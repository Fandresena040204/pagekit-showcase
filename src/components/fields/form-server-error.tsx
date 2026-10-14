/**
 * Server error that matches no field of the form (tanstack-pagekit's
 * `applyServerErrors` puts it in the form's `errorMap.onServer`) — shown
 * once above the form's buttons, so nothing the server said is lost.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FormServerError({ form }: { form: any }) {
  return (
    <form.Subscribe selector={(state: { errorMap: { onServer?: unknown } }) => state.errorMap.onServer}>
      {(error: unknown) =>
        error ? (
          <p role='alert' className='text-sm text-destructive'>
            {String(error)}
          </p>
        ) : null
      }
    </form.Subscribe>
  )
}
