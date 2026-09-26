# pagekit-showcase

POC that rebuilds the **Ventes** feature of [poc-vente-front](../poc-vente-front) — paginated/filtered list, a tabbed detail page, and a master/detail create/edit form — on top of [`tanstack-pagekit`](../tanstack-pagekit), a headless library extracted from that same codebase's CRUD plumbing.

The goal is a side-by-side comparison: same visual interface (same shadcn/ui components, same Tailwind theme, same table/toolbar/badges), but the list/detail/form *logic* comes from the library instead of being hand-written per page.

The app shell (sidebar, header, theme toggle, JWT auth) is also replicated structurally from `poc-vente-front` — not just the Ventes pages — specifically so the two repos can be compared file-by-file, not just screen-by-screen.

## Run it

Needs the real backend running (`../poc-django-tanstack`, Postgres + `manage.py runserver 8000`) — this POC talks to it directly, it no longer ships an in-memory mock.

```bash
# in ../poc-django-tanstack
.venv/Scripts/python.exe manage.py runserver 8000

# in this repo
pnpm install
pnpm dev
```

`.env` sets `VITE_API_BASE_URL=http://localhost:8000`. Sign in with the demo account seeded on the backend: **username `admin`, password `admin1234`** (role `admin`, full permissions).

`pnpm build` typechecks and builds for production.

## What's demonstrated

- **List page** (`/ventes`, `/products`, `/customers`, `/roles`, `/users`) — pagination and filters go to the real Django backend (server-side); sorting is client-side on the loaded page via TanStack Table (`getSortedRowModel`), per this POC's brief. One hook (`useListPage`) replaces `use-table-url-state.ts` + `resource-data-table.tsx` + the per-feature `*-table.tsx` wiring.
- **Detail page with tabs** (`/ventes/$id`) — an addition beyond poc-vente-front, which has no detail route for Ventes (only list + form). Demonstrates `useDetailPage`/`useTabState` (active tab persisted in the URL) and three tabs all using **TanStack Table**: "Lignes" (`useClientTable`), "Livraisons" and "Paiements" (`useListPage`-style calls filtered by `vente`), giving those two backend models real presence in the frontend.
- **"NOUVELLE FACTURE" form** (`/ventes/saisie`, `/ventes/saisie/$id`) — reproduces the exact ASCII mockup from `Concetion_moteur/lib-page-builder`'s conception docs: Client/Date/Devise/Remise globale header, a LIGNES table (Produit/Qté/P.U./Remise/TVA + delete), and a right-aligned Total HT/Remise globale/TVA/TOTAL footer computed **live client-side** (`features/ventes/totals.ts`) using the exact same formula as the backend's `Vente.recalculate_total` — verified end-to-end to match what the server persists after save.
- **Declare a field once** (`src/features/*/fields.tsx`) — the same `FieldDescriptor` (e.g. `customer`, `clickable: true`) feeds the list column (`renderColumn`) **and** the detail header field (`renderDetailField`), instead of being redeclared in each place.
- **Master/detail form** on **TanStack Form** (`useMasterDetailForm`), with server-search autocompletes (`customer`, per-line `product`) and a `fillsFields` cascade (product selection fills `unit_price`).
- **Products / Customers / Roles** — full list + create/edit forms (`useForm` from `@tanstack/react-form` for the non-array cases, same `RenderFormField`/`FieldDescriptor` pattern). Roles' form includes a permission matrix (`features/roles/permission-matrix.tsx`, ported from `roles-permission-matrix.tsx`) — one checkbox per (model × add/view/change/delete) codename, matching `HasRolePermission` on the backend.
- **Users** — list + a "Manage roles" dialog calling the backend's `assign_role`/`remove_role` custom actions. No create/edit form: Django's `UserViewSet` is a `ReadOnlyModelViewSet`, so this page only builds what the real API actually supports.

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

## App shell (ported for manual comparison)

Same structural pieces as `poc-vente-front` (Settings/Help Center/Error pages are the only ones still out of scope — everything else the sidebar links to is a real page here):

- `components/ui/sidebar.tsx` + `components/layout/{app-sidebar,nav-group,nav-user,team-switcher,header,authenticated-layout}.tsx` + `data/sidebar-data.ts` — same collapsible sidebar primitive and composition as the original (minus the collapsed-icon dropdown variant and mobile close-on-navigate, kept out for scope).
- `stores/auth-store.ts` + `lib/api-client.ts` — same zustand store and axios instance (JWT access/refresh cookies, 401 → refresh → retry interceptor) as `poc-vente-front`, byte-for-byte where the logic didn't need to change.
- `context/theme-provider.tsx` (light/dark/system, cookie-persisted) + `context/layout-provider.tsx` (sidebar variant/collapsible cookie).
- `features/auth/{auth-layout,sign-in-page,api}.tsx` — real `/api/token/` login + `/api/auth/me/`, same `Card`/`AuthLayout` shell. Simplified: plain controlled inputs instead of react-hook-form + zod (kept out of this POC's dependency set), no social-login buttons.
- `router.tsx` — same split as `_authenticated/route.tsx`: a `beforeLoad` guard redirects to `/sign-in` without a session, an `AuthenticatedLayout` parent route renders the sidebar/header shell around every real page.

Not ported (cosmetic/peripheral, not what the library touches): the command-palette `Search`, `ConfigDrawer`, `NavigationProgress` bar, and the collapsed-sidebar dropdown submenu variant.

## Known limitations

- **No client-side validation messages.** poc-vente-front's form uses zod + `@hookform/resolvers`; this POC keeps the happy path working (required-ish fields still need real values to submit meaningfully) but doesn't port per-field error messages — out of scope for what the library itself demonstrates.
- **Column header sorting UI is app-side, by design.** `renderColumn`'s default `header` is a plain label string, not a sortable dropdown — the library stays UI-agnostic (see `tanstack-pagekit`'s `field` module design docs), so `*-columns.tsx` plugs in `DataTableColumnHeader` itself via `columnDef.header`, same as it plugs in `renderLink` for clickable columns.
- **`FieldDescriptor.type` has no `'boolean'` variant.** `is_active` on Product/Customer is a plain shadcn `Checkbox` bound directly to `form.Field`, not routed through `RenderFormField`/`FieldDescriptor` — a real gap in the field module's type union, not something worth changing `tanstack-pagekit` for on this POC's timeline.
- **Minimal customer detail page.** `/customers/$id` exists only as a link target for the clickable `customer` field — not a full CRUD page (customers now also have a real list+form at `/customers`, `/customers/saisie`).
- **Settings / Help Center / Error pages** are not ported — they're generic template pages in the original, not something the library touches.

## Browser-automation note

Radix `Popover`/`Command` comboboxes (customer/product/category selects) don't reliably open under this environment's coordinate-simulated mouse clicks — confirmed to be a tool/CDP quirk, not an app bug: `document.querySelector('[role="combobox"]').click()` (a real DOM click) opens them correctly every time, while the `computer` tool's simulated click does not. All verification in this README was done that way.

## Bugs found in tanstack-pagekit while building this

- `useMasterDetailForm`'s TypeScript types hardcoded the lines array field name to `'lignes'` even though the runtime already supported a configurable `linesFieldName`. Naming the field `lines` (as this showcase does) failed to typecheck. Fixed (commit `c0b034e`) by making the field name a proper generic type parameter.

## Demo data

Seeded directly on the Django backend (not committed as a migration — a one-off `manage.py shell` script), independent of this repo:
- User `admin` / `admin1234`, role `admin` (all permissions).
- A few customers, products (with categories), and 3 ventes with lines/livraisons/paiements, so the list/detail pages aren't empty on first login.

## Links

- [`tanstack-pagekit`](../tanstack-pagekit) — the library (private repo: https://github.com/Fandresena040204/tanstack-pagekit)
- [`Concetion_moteur/lib-page-builder/`](../Concetion_moteur/lib-page-builder) — the design docs this library was built from
- [`poc-vente-front`](../poc-vente-front) — the reference app (untouched)
