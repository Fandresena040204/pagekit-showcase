import { ApiErrorState } from '@/components/errors/api-error-state'
import { Link, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { renderDetailField, useDetailPage, useTanStackRouterAdapter } from 'tanstack-pagekit'
import { renderLink } from '@/components/fields/render-link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Vente } from '@/features/types'
import { useAnnulerVente, useValiderVente, useVente } from './resource'
import { CURRENCY_FIELD, CUSTOMER_FIELD, ID_FIELD, STATUS_FIELD, TOTAL_FIELD } from './fields'
import { LignesTab } from './tabs/lignes-tab'
import { LivraisonsTab } from './tabs/livraisons-tab'
import { PaiementsTab } from './tabs/paiements-tab'

const TABS = ['lignes', 'livraisons', 'paiements'] as const

export function VentesDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const router = useTanStackRouterAdapter()

  const { entity, isLoading, isError, activeTab, setActiveTab, isTabActive } = useDetailPage<Vente>({
    router,
    tabs: TABS,
    defaultTab: 'lignes',
    useEntity: () => useVente(id),
  })

  const validerVente = useValiderVente()
  const annulerVente = useAnnulerVente()

  if (isLoading) {
    return (
      <Main className='flex flex-1 items-center justify-center'>
        <Loader2 className='animate-spin' />
      </Main>
    )
  }

  if (isError || !entity) {
    return (
      <Main>
        <ApiErrorState />
      </Main>
    )
  }

  const headerFields = [ID_FIELD, CUSTOMER_FIELD, STATUS_FIELD, CURRENCY_FIELD, TOTAL_FIELD].map((descriptor) =>
    renderDetailField(descriptor, entity, { renderLink })
  )

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Vente {entity.id}</h2>
          <p className='text-muted-foreground'>Vente details and lines.</p>
        </div>
        <div className='flex gap-2'>
          {/* Mirror the backend's FSM: draft -> validated -> cancelled
              (Vente.validate_vente/cancel_vente) — only the action that's a
              legal transition from the current status is shown. */}
          {entity.status === 'draft' && (
            <Button
              variant='outline'
              disabled={validerVente.isPending}
              onClick={() => validerVente.mutate(entity.id)}
            >
              {validerVente.isPending && <Loader2 className='animate-spin' />}
              Valider
            </Button>
          )}
          {entity.status === 'validated' && (
            <Button
              variant='outline'
              disabled={annulerVente.isPending}
              onClick={() => annulerVente.mutate(entity.id)}
            >
              {annulerVente.isPending && <Loader2 className='animate-spin' />}
              Annuler
            </Button>
          )}
          <Button asChild variant='outline'>
            <Link to='/ventes/saisie/$id' params={{ id: entity.id }}>
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <dl className='grid grid-cols-2 gap-x-6 gap-y-3 rounded-md border p-4 sm:grid-cols-4'>
        {headerFields.map((field) => (
          <div key={field.label}>
            <dt className='text-xs text-muted-foreground'>{field.label}</dt>
            <dd className='mt-0.5'>{field.value as React.ReactNode}</dd>
          </div>
        ))}
        <div>
          <dt className='text-xs text-muted-foreground'>Created</dt>
          <dd className='mt-0.5'>{new Date(entity.created_at).toLocaleString()}</dd>
        </div>
        <div>
          <dt className='text-xs text-muted-foreground'>Updated</dt>
          <dd className='mt-0.5'>{new Date(entity.updated_at).toLocaleString()}</dd>
        </div>
      </dl>

      {/* No "Général" tab: created_at/updated_at moved into the header
          above, Lignes/Livraisons/Paiements are the only tabs — one fewer
          click to reach the content that actually needs a table. */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='lignes'>
            Lignes <Badge variant='secondary' className='ms-1'>{entity.lines.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value='livraisons'>Livraisons</TabsTrigger>
          <TabsTrigger value='paiements'>Paiements</TabsTrigger>
        </TabsList>
        <TabsContent value='lignes' className='pt-4'>
          {isTabActive('lignes') && <LignesTab lines={entity.lines} />}
        </TabsContent>
        <TabsContent value='livraisons' className='pt-4'>
          {isTabActive('livraisons') && <LivraisonsTab venteId={entity.id} />}
        </TabsContent>
        <TabsContent value='paiements' className='pt-4'>
          {isTabActive('paiements') && <PaiementsTab venteId={entity.id} />}
        </TabsContent>
      </Tabs>
    </Main>
  )
}
