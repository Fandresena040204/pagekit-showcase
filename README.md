# pagekit-showcase

POC that rebuilds the **Ventes** feature of [poc-vente-front](../poc-vente-front) — paginated/filtered list, a tabbed detail page, and a master/detail create/edit form — on top of [`tanstack-pagekit`](../tanstack-pagekit), a headless library extracted from that same codebase's CRUD plumbing.

The goal is a side-by-side comparison: same visual interface (same shadcn/ui components, same Tailwind theme, same table/toolbar/badges), but the list/detail/form *logic* comes from the library instead of being hand-written per page.

## Run it

```bash
pnpm install
pnpm dev
```

Open `/ventes`. No backend needed — `src/mock/` implements `tanstack-pagekit`'s `HttpClient` contract in memory (same paginated response shape and query params a real Django backend would receive), seeded with a handful of customers/products/ventes.

`pnpm build` typechecks and builds for production.

## What's demonstrated

- **List page** (`/ventes`) — pagination and the status filter go to the mock backend (server-side); sorting is client-side on the loaded page via TanStack Table (`getSortedRowModel`), per this POC's brief. One hook (`useListPage`) replaces `use-table-url-state.ts` + `resource-data-table.tsx` + the per-feature wiring in `ventes-table.tsx`.
- **Detail page with tabs** (`/ventes/$id`) — an addition beyond poc-vente-front, which has no detail route for Ventes (only list + form). Demonstrates `useDetailPage`/`useTabState` (active tab persisted in the URL) and a "Lignes" tab using **TanStack Table** too, via `useClientTable`.
- **Declare a field once** (`src/features/ventes/fields.tsx`) — the same `FieldDescriptor` (e.g. `customer`, `clickable: true`) feeds the list column (`renderColumn`) **and** the detail header field (`renderDetailField`), instead of being redeclared in each place.
- **Master/detail form** (`/ventes/saisie`, `/ventes/saisie/$id`) — `useMasterDetailForm` on **TanStack Form**, with a server-search autocomplete for `customer` and a per-line product autocomplete whose selection cascades into `unit_price` (`fillsFields`).

## File-by-file correspondence

| poc-vente-front (react-hook-form + local plumbing) | pagekit-showcase (tanstack-pagekit) | old | new |
|---|---|---:|---:|
| `hooks/use-table-url-state.ts` + `components/crud/resource-data-table.tsx` + `features/ventes/components/ventes-table.tsx` | `useListPage` (in the lib) + `features/ventes/ventes-list-page.tsx` | 247+168+116 = 531 | 129 (+ lib, shared) |
| `lib/crud/create-resource-api.ts` + `create-resource-hooks.ts` | `createResourceApi`/`createResourceHooks` (in the lib) + `features/ventes/resource.ts` | 106+105 = 211 | 34 (+ lib, shared) |
| `lib/fields/field-descriptor.ts` + `use-field-dependencies.ts` + `components/fields/render-column.tsx` | `FieldDescriptor`/`useFieldOptions`/`renderColumn` (in the lib) + `features/ventes/fields.tsx` | 94+184+61 = 339 | 98 (+ lib, shared) |
| `components/fields/render-form-field.tsx` (react-hook-form) | `components/fields/render-form-field.tsx` (TanStack Form) | 165 | 67 |
| `features/ventes/components/ventes-columns.tsx` | `features/ventes/ventes-columns.tsx` | 84 | 47 |
| `features/ventes/components/ventes-form.tsx` + `saisie.tsx` | `features/ventes/ventes-form-page.tsx` | 245+53 = 298 | 135 |
| `features/ventes/index.tsx` | folded into `ventes-list-page.tsx` | 66 | — |
| — (no detail route) | `ventes-detail-page.tsx` | — | 167 (new capability) |
| **Total (feature + the plumbing it needed)** | | **1790** | **740** |

The 740 is feature-only code; the plumbing it leans on (`useListPage`, `createResource*`, `FieldDescriptor`/`useFieldOptions`/`renderColumn`, `useDetailPage`, `useMasterDetailForm`) lives once in [`tanstack-pagekit`](../tanstack-pagekit) (~1300 lines total across ALL its modules) and is reused by every feature, not copy-pasted per entity like `use-table-url-state.ts`/`resource-data-table.tsx` effectively are today (Products/Customers/Users each wire their own `*-table.tsx` against the same pattern).

## Known limitations

- **Mock backend, not Django.** `src/mock/http-client.ts` is in-memory (resets on page reload / Vite HMR of that file) — it mimics DRF's paginated shape and query params closely enough to exercise the library end-to-end, but isn't the real API.
- **No app shell replicated.** The sidebar, auth, team switcher, theme/font/direction providers, and the rest of poc-vente-front's admin chrome are out of scope — only the Ventes pages themselves (which is what the library actually touches) were rebuilt, with a minimal header instead.
- **No client-side validation messages.** poc-vente-front's form uses zod + `@hookform/resolvers`; this POC keeps the happy path working (required-ish fields still need real values to submit meaningfully) but doesn't port per-field error messages — out of scope for what the library itself demonstrates.
- **Column header sorting UI is app-side, by design.** `renderColumn`'s default `header` is a plain label string, not a sortable dropdown — the library stays UI-agnostic (see `tanstack-pagekit`'s `field` module design docs), so `ventes-columns.tsx` plugs in `DataTableColumnHeader` itself via `columnDef.header`, same as it plugs in `renderLink` for the clickable `customer` column.
- **Minimal customer detail page.** `/customers/$id` exists only as a link target for the clickable `customer` field — not a full CRUD page.

## Bug found in tanstack-pagekit while building this

`useMasterDetailForm`'s TypeScript types hardcoded the lines array field name to `'lignes'` even though the runtime already supported a configurable `linesFieldName`. Naming the field `lines` (as this showcase does) failed to typecheck. Fixed in `tanstack-pagekit` (commit `c0b034e`) by making the field name a proper generic type parameter.

## Links

- [`tanstack-pagekit`](../tanstack-pagekit) — the library (private repo: https://github.com/Fandresena040204/tanstack-pagekit)
- [`Concetion_moteur/lib-page-builder/`](../Concetion_moteur/lib-page-builder) — the design docs this library was built from
- [`poc-vente-front`](../poc-vente-front) — the reference app (untouched)
