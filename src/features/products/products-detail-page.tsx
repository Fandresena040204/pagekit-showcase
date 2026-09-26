import { useMemo } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { renderDetailField } from 'tanstack-pagekit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { useProductCategories } from '@/features/product-categories/resource'
import { useProduct } from './resource'
import { CATEGORY_FIELD, NAME_FIELD, PRICE_FIELD, SKU_FIELD, categoryOptions } from './fields'

/** Reuses the SAME `FieldDescriptor`s as the list columns (`fields.tsx`) via `renderDetailField` instead of `renderColumn`. */
export function ProductsDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const { data: product, isLoading, isError } = useProduct(id)
  const { data: categories } = useProductCategories()
  const categoryNameById = useMemo(
    () => Object.fromEntries((categories ?? []).map((c) => [c.id, c.name])),
    [categories]
  )

  if (isLoading) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <Loader2 className='animate-spin' />
      </Main>
    )
  }

  if (isError || !product) {
    return (
      <Main>
        <p className='text-destructive'>Product not found.</p>
      </Main>
    )
  }

  const fields = [NAME_FIELD, SKU_FIELD, PRICE_FIELD, CATEGORY_FIELD].map((descriptor) =>
    renderDetailField(descriptor, product, { resolvedOptions: categoryOptions(categoryNameById) })
  )

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>{product.name}</h2>
          <p className='text-muted-foreground'>{product.id}</p>
        </div>
        <div className='flex gap-2'>
          <Badge variant='outline' className={product.is_active ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'}>
            {product.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <Button asChild variant='outline'>
            <Link to='/products/saisie/$id' params={{ id: product.id }}>
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <dl className='grid grid-cols-2 gap-x-6 gap-y-3 rounded-md border p-4 sm:grid-cols-4'>
        {fields.map((field) => (
          <div key={field.label}>
            <dt className='text-xs text-muted-foreground'>{field.label}</dt>
            <dd className='mt-0.5'>{field.value as React.ReactNode}</dd>
          </div>
        ))}
      </dl>

      {product.description && (
        <div className='rounded-md border p-4'>
          <p className='text-xs text-muted-foreground'>Description</p>
          <p className='mt-1 text-sm'>{product.description}</p>
        </div>
      )}
    </Main>
  )
}
