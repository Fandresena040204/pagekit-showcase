// Mirrors the shapes of poc-vente-front/src/features/{ventes,customers,products}/data/schema.ts
// (zod schemas there — plain TS types here, validation kept lightweight for this POC).

export type Customer = {
  id: string
  created_at: string
  updated_at: string
  name: string
  email: string
  phone: string
}

export type CustomerForm = {
  name: string
  email: string
  phone: string
}

export type Product = {
  id: string
  created_at: string
  updated_at: string
  name: string
  sku: string
  default_price: string
}

export type ProductForm = {
  name: string
  sku: string
  default_price: string
}

export type VenteStatus = 'draft' | 'validated' | 'cancelled'

export type VenteLigne = {
  id: string
  product: string
  quantity: string
  unit_price: string
}

export type Vente = {
  id: string
  created_at: string
  updated_at: string
  customer: string
  status: VenteStatus
  total: string
  lines: VenteLigne[]
}

export type VenteLineForm = {
  id?: string
  product: string
  quantity: string
  unit_price: string
}

export type VenteForm = {
  customer: string
  lines: VenteLineForm[]
}
