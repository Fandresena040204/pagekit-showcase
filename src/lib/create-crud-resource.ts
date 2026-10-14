import { createCrudResourceFactory } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'

/**
 * `createCrudResource` bound once to this app's `httpClient` and toasts —
 * the factory itself lives in `tanstack-pagekit`, which stays headless.
 *
 * A resource whose queryKey/notify label diverge from plain CRUD phrasing,
 * or that needs `createSubResourceHooks`/`createActionHook` alongside this,
 * still composes those directly — this only replaces the repetitive part.
 */
export const createCrudResource = createCrudResourceFactory({
  http: httpClient,
  notify: {
    onCreated: (label) => toast.success(`${label} created.`),
    onUpdated: (label) => toast.success(`${label} updated.`),
    onDeleted: (label) => toast.success(`${label} deleted.`),
  },
})