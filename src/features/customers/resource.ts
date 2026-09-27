import { createResourceApi, createResourceHooks } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { httpClient } from '@/lib/http-client'
import type { Customer, CustomerForm } from '@/features/types'

function toPayload(values: CustomerForm) {
  // Django's DateField rejects '' (only null or a real date) — the form's
  // empty state is '', so it's converted here rather than in the page.
  return { ...values, birth_date: values.birth_date || null }
}

export const customersApi = createResourceApi<Customer, CustomerForm>(httpClient, '/api/customers/', { toPayload })

export const {
  useList: useCustomers,
  useListPage: useCustomersPage,
  useOne: useCustomer,
  useCreate: useCreateCustomer,
  useUpdate: useUpdateCustomer,
  useDelete: useDeleteCustomer,
} = createResourceHooks(['customers'], customersApi, {
  entityLabel: 'Customer',
  notify: {
    onCreated: (label) => toast.success(`${label} created.`),
    onUpdated: (label) => toast.success(`${label} updated.`),
    onDeleted: (label) => toast.success(`${label} deleted.`),
  },
})
