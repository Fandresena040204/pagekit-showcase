import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { LivraisonsTab } from './tabs/livraisons-tab'

/**
 * Preview, without navigating, of a Vente's Livraisons tab — reuses
 * `LivraisonsTab` as-is (possible only because §1 split it into its own
 * file). Which tab gets previewed is a decision per list page, not generic:
 * another list page could preview a different tab of its own detail page,
 * with its own small component on this same model.
 */
export function VentesPreviewLivraisons({ venteId }: { venteId: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' aria-label='Aperçu des livraisons'>
          <Plus className='size-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[480px]' align='start'>
        {/* Monté seulement à l'ouverture — même idiome que isTabActive(...)
            sur la page consulte (useDetailPage) : pas de requête tant que
            le popover n'a pas été ouvert au moins une fois. */}
        {open && <LivraisonsTab venteId={venteId} />}
      </PopoverContent>
    </Popover>
  )
}
