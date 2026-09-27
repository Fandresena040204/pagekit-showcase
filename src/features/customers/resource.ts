import { createCrudResource } from '@/lib/create-crud-resource'
import type { Customer, CustomerForm } from '@/features/types'

function toPayload(values: CustomerForm) {
  // Django's DateField rejects '' (only null or a real date) — the form's
  // empty state is '', so it's converted here rather than in the page.
  return { ...values, birth_date: values.birth_date || null }
}

export const {
  api: customersApi,
  useList: useCustomers,
  useListPage: useCustomersPage,
  useOne: useCustomer,
  useCreate: useCreateCustomer,
  useUpdate: useUpdateCustomer,
  useDelete: useDeleteCustomer,
} = createCrudResource<Customer, CustomerForm>('customers', '/api/customers/', 'Customer', { toPayload })
