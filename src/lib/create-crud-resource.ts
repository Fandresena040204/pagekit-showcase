import { createResourceApi, createResourceHooks } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'

type CreateCrudResourceOptions<TForm> = {
  toPayload?: (values: TForm) => unknown
}

/**
 * Collapses the `createResourceApi` + `createResourceHooks` wiring every
 * feature's `resource.ts` repeats verbatim (same `httpClient`, same
 * "Created."/"Updated."/"Deleted." toast messages) into one call. Lives in
 * the app, not `tanstack-pagekit`, since it bakes in this app's concrete
 * `httpClient`/`toast` — the library itself stays headless and takes both
 * as injected arguments (see `createResourceApi`/`createResourceHooks`).
 *
 * A resource whose queryKey/notify label diverge from plain CRUD phrasing,
 * or that needs `createSubResourceHooks`/`createActionHook` alongside this,
 * still composes those directly — this only replaces the repetitive part.
 */
export function createCrudResource<TEntity, TForm>(
  queryKey: string,
  endpoint: string,
  entityLabel: string,
  options: CreateCrudResourceOptions<TForm> = {}
) {
  const api = createResourceApi<TEntity, TForm>(httpClient, endpoint, { toPayload: options.toPayload })

  const hooks = createResourceHooks([queryKey], api, {
    entityLabel,
    notify: {
      onCreated: (label) => toast.success(`${label} created.`),
      onUpdated: (label) => toast.success(`${label} updated.`),
      onDeleted: (label) => toast.success(`${label} deleted.`),
    },
  })

  return { api, ...hooks }
}
