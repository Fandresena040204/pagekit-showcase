import { createResourceApi, createResourceHooks } from 'tanstack-pagekit'
import { toast } from '@/lib/toast'
import { mockHttpClient } from '@/mock/http-client'
import type { Customer, CustomerForm } from '@/features/types'

export const customersApi = createResourceApi<Customer, CustomerForm>(mockHttpClient, '/api/customers/')

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
