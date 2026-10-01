// The explicit `?:` return type matters: without it, TypeScript infers
// `prefillSource: string | undefined` (key always present), which makes
// TanStack Router require a `search` prop on every `<Link>` to this route
// — including ones that have nothing to do with prefill. `?:` makes both
// keys omissible, so `search={{}}` (or no `search` at all where the route
// doesn't require it) still works exactly as before.
export function prefillSearchSchema(
  search: Record<string, unknown>
): { prefillSource?: string; prefillId?: string } {
  return {
    prefillSource: typeof search.prefillSource === 'string' ? search.prefillSource : undefined,
    prefillId: typeof search.prefillId === 'string' ? search.prefillId : undefined,
  }
}
