// Mirrors the shapes of poc-vente-front/src/features/{ventes,customers,products}/data/schema.ts
// (zod schemas there — plain TS types here, validation kept lightweight for this POC),
// kept in sync with poc-django-tanstack's serializers (see apps/*/serializers/*.py).

export type Customer = {
  id: string
  created_at: string
  updated_at: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  birth_date: string | null
  is_active: boolean
}

// Same fields as `Customer` minus server-assigned ones, with `birth_date`
// narrowed from `string | null` to `string` (the form's empty state is ''
// — see customers/resource.ts's `toPayload` for the '' -> null conversion
// back on submit) — not a plain `Omit<Customer, ...>` because of that.
export type CustomerForm = Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'birth_date'> & {
  birth_date: string
}

export type ProductCategory = {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  created_at: string
  updated_at: string
  name: string
  sku: string
  default_price: string
  category: string | null
  /** Resolved server-side (ProductSerializer.get_category_name) — null when `category` is null. */
  category_name: string | null
  description: string
  is_active: boolean
}

// Same fields as `Product` minus server-assigned/resolved ones, with
// `category` narrowed from `string | null` to `string` (the select field's
// empty state is '' — no such thing as a `null` selection in the form).
export type ProductForm = Omit<
  Product,
  'id' | 'created_at' | 'updated_at' | 'category_name' | 'category'
> & { category: string }

export type VenteStatus = 'draft' | 'validated' | 'cancelled'
export type VentePriority = 'low' | 'normal' | 'high'
export type VenteCurrency = 'MGA' | 'EUR' | 'USD'

export type VenteLigne = {
  id: string
  product: string
  /** Resolved server-side (VenteLigneSerializer) — no client-side product lookup needed. */
  product_name: string
  product_sku: string
  quantity: string
  unit_price: string
  discount_percent: string
  tva_rate: string
}

export type Vente = {
  id: string
  created_at: string
  updated_at: string
  customer: string
  /** Resolved server-side (VenteSerializer.customer_name) — no client-side customer lookup needed. */
  customer_name: string
  status: VenteStatus
  priority: VentePriority
  currency: VenteCurrency
  discount_percent: string
  // Server-computed breakdown (read-only — see Vente.recalculate_total in
  // poc-django-tanstack): subtotal_ht is the sum of each line's HT (net of
  // its own discount_percent), discount_amount is subtotal_ht * the global
  // discount_percent, tva_amount sums each line's HT * (1 - global
  // discount) * its own tva_rate, and total = subtotal_ht - discount_amount
  // + tva_amount.
  subtotal_ht: string
  discount_amount: string
  tva_amount: string
  total: string
  expected_delivery_date: string | null
  notes: string
  lines: VenteLigne[]
}

export type VenteLineForm = {
  id?: string
  product: string
  quantity: string
  unit_price: string
  discount_percent: string
  tva_rate: string
}

export type VenteForm = {
  customer: string
  currency: VenteCurrency
  discount_percent: string
  expected_delivery_date: string
  lines: VenteLineForm[]
}

export type LivraisonStatus = 'pending' | 'shipped' | 'delivered'

export type Livraison = {
  id: string
  vente: string
  status: LivraisonStatus
  delivery_date: string | null
  address: string
  tracking_number: string
  created_at: string
  updated_at: string
}

export type PaiementMethod = 'cash' | 'card' | 'transfer'

export type Paiement = {
  id: string
  vente: string
  amount: string
  method: PaiementMethod
  paid_at: string
  reference: string
  created_at: string
  updated_at: string
}

// Django's `auth.Permission` codenames the API deals in, e.g. 'view_vente'.
export type Role = {
  id: string
  name: string
  permissions: string[]
}

export type RoleForm = Omit<Role, 'id'>

export type User = {
  id: string
  username: string
  email: string
  is_active: boolean
  is_staff: boolean
  roles: string[]
}
