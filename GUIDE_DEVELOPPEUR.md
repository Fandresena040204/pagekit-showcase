# Guide développeur — Frontend (pagekit-showcase)

Ce guide explique comment ajouter une ressource côté frontend : types,
champs, appels API/hooks, pages liste/détail/formulaire, route, entrée de
menu. Il ne couvre que ce dépôt (`pagekit-showcase`) — pour le backend,
voir `GUIDE_DEVELOPPEUR.md` dans `poc-django-tanstack`. Pour
l'installation et le lancement, voir `README.md`.

Les exemples reprennent la ressource **Product** comme fil rouge (la plus
simple : lecture/écriture séparées via une vue DB, mais pas de champ
imbriqué). Pour une ressource avec un tableau de lignes imbriquées
(master/detail), s'inspirer de **Vente** à la place — les différences
sont signalées à chaque section.

**Ce dépôt est un showcase de `tanstack-pagekit`**, une librairie
headless (voir `../tanstack-pagekit`) : elle fournit la *logique*
(pagination, filtres, formulaire, invalidation de cache) mais aucun
composant visuel. Chaque fichier ci-dessous répond à une question
différente sur la ressource : « c'est quoi le type ? », « comment
afficher/éditer un champ ? », « comment l'API est-elle appelée ? »,
« comment est-ce affiché ? » — les garder séparés (ne pas re-fusionner
`fields.tsx` dans la page, par ex.) permet de réutiliser un
`FieldDescriptor` à la fois dans la colonne de liste et le champ de
détail (§ 2).

```
src/features/products/
├── fields.tsx          # FieldDescriptor (liste + détail + form) + colonnes de la liste
├── resource.ts          # API + hooks React Query (createCrudResource)
├── products-list-page.tsx
├── products-detail-page.tsx
└── products-form-page.tsx
```

---

## 1. Les types (`src/features/types.ts`)

Deux façons de déclarer le type d'une entité, selon si le backend a un
split lecture/écriture (voir le guide backend, § 6) :

**Ressource avec split lecture/écriture** (Product, Vente) — le type
`Entity` (affichage) et `EntityForm` (écriture) sont des **alias générés**
depuis le schéma OpenAPI du backend, pas recopiés à la main :

```ts
import type { components } from '@/lib/api-types'

// = le serializer de LECTURE (`ProductRead`, backé par la vue DB) —
// category_name déjà résolu, tel quel depuis le backend.
export type Product = components['schemas']['ProductRead']

// = le serializer d'ÉCRITURE (`Product`), moins les champs assignés par
// le serveur, avec `category` resserré de `string | null` à `string`
// (l'état vide d'un select est '', pas null).
export type ProductForm = Omit<
  components['schemas']['Product'],
  'id' | 'created_at' | 'updated_at' | 'category'
> & { category: string }
```

`components` vient de `src/lib/api-types.ts`, **généré** — voir § 8, ne
jamais l'éditer à la main (il est regénéré en entier à chaque run).

**Ressource sans split** (Customer, Livraison, Paiement, User pour
l'instant) — reste hand-written : un seul schéma généré sert les deux
sens, donc `drf-spectacular` marque optionnel (`?`) tout champ non requis
à l'écriture, même s'il est toujours présent en lecture — utilisable,
mais moins précis pour l'affichage. Router un type existant vers le
générateur reste possible (voir `Role`, qui utilise `Required<...>` pour
compenser), à faire au cas par cas plutôt que partout d'un coup.

**Jamais générable, reste toujours hand-written** : `VenteForm.lines` —
sa forme (id optionnel, conventions de tableau TanStack Form) diverge
volontairement du schéma d'écriture, ce n'est pas un simple oubli de
champs serveur à retirer.

---

## 2. Les champs (`fields.tsx`)

Un `FieldDescriptor<T>` décrit **un champ**, indépendamment d'où il est
affiché — le même objet alimente une colonne de liste
(`renderColumn`), un champ de détail (`renderDetailField`) **et** un
champ de formulaire (`RenderFormField`) :

```tsx
// src/features/products/fields.tsx
export const CATEGORY_FIELD: FieldDescriptor<Product> = {
  name: 'category_name',   // résolu côté serveur (§ 6 backend) — pas de lookup client
  label: 'Category',
  type: 'text',
}

export const CATEGORY_FORM_FIELD: FieldDescriptor<ProductForm> = {
  name: 'category',
  label: 'Category',
  type: 'select',
  placeholder: 'Select a category...',
  options: () =>
    productCategoriesApi.fetchAll().then((cats) => cats.map((c) => ({ label: c.name, value: c.id }))),
}
```

Deux jeux de descripteurs par ressource : ceux basés sur `Entity` pour
l'affichage (liste/détail), ceux basés sur `EntityForm` pour l'édition —
même champ métier, deux `FieldDescriptor` (l'un affiche `category_name`
en lecture seule, l'autre édite `category` via un select). Un champ
cliquable (`clickable: true, linkTo: (row) => ({...})`) fonctionne dans
les deux rendus (`renderColumn`/`renderDetailField`) sans rien changer.

**Les colonnes de la liste vivent aussi dans ce fichier**, juste après
les `FieldDescriptor` dont elles dépendent — une constante de module,
pas une fonction séparée dans un fichier `*-columns.tsx` (supprimés :
chacun n'était qu'un `createXColumns()` à usage unique, enveloppé dans un
`useMemo` inutile puisque sans props) :

```tsx
export const PRODUCTS_COLUMNS: ColumnDef<Product>[] = [
  renderColumn(NAME_FIELD, { renderLink, columnDef: withSortableHeader(NAME_FIELD) }),
  renderColumn(SKU_FIELD, { columnDef: withSortableHeader(SKU_FIELD) }),
  renderColumn(CATEGORY_FIELD, {}),
  renderColumn(ACTIVE_FIELD, { columnDef: { enableSorting: false } }),
]
```

`withSortableHeader` (`src/components/fields/with-sortable-header.tsx`)
et `renderLink` (`src/components/fields/render-link.tsx`) sont l'adaptateur
app-side qui branche les vrais composants shadcn/ui (`DataTableColumnHeader`,
`<Link>`) sur les descripteurs headless de la lib — partagés par toutes
les features, à réutiliser tels quels plutôt que redéfinis par ressource.

---

## 3. L'appel API et les hooks (`resource.ts`)

`createCrudResource` (`src/lib/create-crud-resource.ts`, app-side —
bake in `httpClient`/`toast` concrets, donc pas dans `tanstack-pagekit`
qui reste headless) collapse tout le CRUD standard en un seul appel :

```ts
// src/features/products/resource.ts
import { createCrudResource } from '@/lib/create-crud-resource'
import type { Product, ProductForm } from '@/features/types'

export const {
  api: productsApi,
  useList: useProducts,
  useListPage: useProductsPage,
  useOne: useProduct,
  useCreate: useCreateProduct,
  useUpdate: useUpdateProduct,
  useDelete: useDeleteProduct,
} = createCrudResource<Product, ProductForm>('products', '/api/products/', 'Product')
```

Signature : `createCrudResource(queryKey, endpoint, entityLabel, { toPayload? })`.
`toPayload` seulement si les valeurs du formulaire doivent être
retravaillées avant l'envoi (ex. `customers/resource.ts` convertit
`birth_date: ''` en `null`, Django rejetant la chaîne vide sur un
`DateField`).

**Une action métier hors CRUD standard** (ex. `valider`/`annuler` une
Vente) reste un `createActionHook` séparé, à côté :

```ts
export const useValiderVente = createActionHook<string>(
  ['ventes'],
  (id) => httpClient.post(`/api/ventes/${id}/valider/`, {}),
  () => toast.success('Vente validated.')
)
```

**Sous-ressource filtrée par FK** (ex. les Livraisons d'une Vente,
`/api/livraisons/?vente=<id>`) — `createSubResourceHooks`, pas
`createCrudResource` :

```ts
export const { useSubResourceList: useLivraisonsByVente } = createSubResourceHooks<Livraison>(
  httpClient, '/api/livraisons/', 'vente', ['livraisons', 'by-vente']
)
```

**Ressource en lecture seule** (User — `ReadOnlyModelViewSet` côté
backend) — appeler `createCrudResource` normalement, ne juste pas
déstructurer `useCreate`/`useUpdate`/`useDelete` (ils existent mais ne
sont jamais utilisés).

---

## 4. La page liste

```tsx
// src/features/products/products-list-page.tsx
import { useListPage, useTanStackRouterAdapter } from 'tanstack-pagekit'
import { useProductsPage } from './resource'
import { PRODUCTS_COLUMNS } from './fields'

const { table, isLoading, isError, search: runSearch } = useListPage({
  router: useTanStackRouterAdapter(),
  resource: { useListPage: useProductsPage },
  columns: PRODUCTS_COLUMNS,
  pagination: { defaultPageSize: 10 },
  searchMode: 'button',
  columnFilters: [
    { columnId: 'name', searchKey: 'name', type: 'string' },
    { columnId: 'category_name', searchKey: 'category', type: 'array' },
  ],
})
```

`columnFilters` mappe l'id de colonne (ce qui s'affiche/se trie) au
paramètre backend (ce qui est envoyé en `?query=`) — ils divergent
volontairement quand la colonne affiche un libellé résolu mais que le
backend filtre toujours par id (`columnId: 'category_name'`,
`searchKey: 'category'` — voir Vente pour le même pattern sur `customer`).
Trois types : `'string'` (texte libre), `'array'` (facette multi-select),
`'range'` (min/max, deux `searchKey`).

Le rendu (toolbar, table, pagination) est écrit à la main avec les
composants shadcn/ui (`DataTableToolbar`, `Table`, `DataTablePagination`)
— la lib fournit `table`/`isLoading`/`isError`/`runSearch`, pas de JSX.
Voir `products-list-page.tsx` en entier pour le reste (bouton "Add",
état vide, lien "Edit" par ligne).

---

## 5. La page détail

Réutilise les **mêmes** `FieldDescriptor` que la liste, via
`renderDetailField` au lieu de `renderColumn` :

```tsx
const fields = [NAME_FIELD, SKU_FIELD, PRICE_FIELD, CATEGORY_FIELD].map((d) =>
  renderDetailField(d, product)
)
```

Pour une ressource avec des onglets (ex. Vente : Lignes/Livraisons/
Paiements), voir `ventes-detail-page.tsx` et `useTabState` (tanstack-pagekit)
— l'onglet actif est persisté dans l'URL.

---

## 6. La page formulaire

**Cas simple** (pas de tableau imbriqué) — `useResourceForm` gère
isEdit/loading/notFound/create-vs-update/isPending, la page ne fournit
que le mapping de champs et le JSX :

```tsx
// src/features/products/products-form-page.tsx
const { form, isEdit, isLoading, notFound, isPending } = useResourceForm<Product, ProductForm>({
  id,
  resource: { useOne: useProduct, useCreate: useCreateProduct, useUpdate: useUpdateProduct },
  emptyValues: { name: '', sku: '', default_price: '0.00', category: '', description: '', is_active: true },
  toFormValues: (product) => ({ ...product, category: product.category ?? '' }),
  onSuccess: () => navigate({ to: '/products' }),
})
```

```tsx
<RenderFormField descriptor={NAME_FORM_FIELD} form={form} />
```

Un champ hors du type union de `FieldDescriptor` (text/number/date/
datetime/select) — ex. un booléen — reste un `form.Field` direct plutôt
que `RenderFormField` (voir `is_active` dans `products-form-page.tsx`).

**Cas master/detail** (tableau de lignes, ex. Vente/VenteLigne) —
`useMasterDetailForm` à la place, avec `lineFormFields(index)` générant
les descripteurs de chaque ligne dynamiquement, et `fillsFields` pour les
cascades (sélectionner un produit remplit `unit_price`) — voir
`ventes/fields.tsx` (`lineFormFields`) et `ventes-form-page.tsx` en
entier, pas reproduit ici (trop spécifique pour être un extrait utile).

---

## 7. Router et menu

**Route** (`src/router.tsx`) — quatre routes standard par ressource
CRUD, toutes filles de `authenticatedRoute` :

```tsx
const productsListRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/products', component: ProductsListPage })
const productsDetailRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/products/$id', component: ProductsDetailPage })
const productsNewRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/products/saisie', component: ProductsFormPage })
const productsEditRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: '/products/saisie/$id', component: ProductsFormPage })
```

Puis les ajouter au tableau `children` de `authenticatedRoute.addChildren([...])`
plus bas dans le même fichier. Une ressource en lecture seule (User) n'a
que la route liste + détail, pas `saisie`.

**Entrée de menu** (`src/components/layout/data/sidebar-data.ts`) — le
`permission` gate correspond exactement au codename Django (`view_product`/
`add_product`, voir le guide backend § 5) : l'entrée ne s'affiche que si
l'utilisateur connecté a la permission.

```ts
{
  title: 'Products',
  icon: Package,
  items: [
    { title: 'Liste', url: '/products', permission: 'view_product' },
    { title: 'Saisie', url: '/products/saisie', permission: 'add_product' },
  ],
},
```

---

## 8. Générer les types depuis le backend

```bash
npm run generate:api-types
```

Lance `openapi-typescript` sur `../poc-django-tanstack/schema.yml` →
régénère `src/lib/api-types.ts` en entier. Suppose que le backend est un
dossier frère (`../poc-django-tanstack`) avec un `schema.yml` à jour —
sinon, régénérer côté backend d'abord (`manage.py spectacular --file
schema.yml --fail-on-warn`, voir son guide § 11).

**Quand le relancer** : après tout changement de serializer côté backend
qui touche une ressource migrée vers les types générés (§ 1) — champ
ajouté/retiré/renommé, nouveau split lecture/écriture. `tsc -b` (ou
`npm run build`) fait immédiatement apparaître les usages cassés si un
champ a disparu, pas de dérive silencieuse.

**Ne jamais éditer `src/lib/api-types.ts` à la main** — tout changement y
serait écrasé au prochain run. Un ajustement de forme (ex. resserrer un
`string | null` en `string` pour un formulaire) se fait dans
`features/types.ts`, en alias/`Omit` par-dessus le type généré (§ 1),
jamais dans le fichier généré lui-même.

---

## 9. Vérifications avant de pousser

```bash
npx tsc --noEmit   # ou npm run build (tsc -b && vite build)
```

Pas de linter configuré dans ce repo pour l'instant (`package.json` n'a
pas de script `lint`) — `tsc` reste la seule vérification statique. Pour
une ressource touchant à l'UI, un passage manuel dans le navigateur (liste,
création, édition) reste nécessaire — pas de suite de tests automatisés
côté frontend actuellement.
