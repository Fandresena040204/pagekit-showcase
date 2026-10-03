import { Link } from '@tanstack/react-router'
import { Ban, Lock, SearchX, ServerCrash, WifiOff, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isAxiosError } from 'axios'

type ErrorInfo = { icon: LucideIcon; title: string; description: string }

// Wording is shown to the end user, so it says what happened and what to do.
function describe(status: number | undefined, noResponse = false): ErrorInfo {
  if (status === undefined && noResponse) {
    return {
      icon: WifiOff,
      title: 'Serveur injoignable',
      description: 'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.',
    }
  }
  if (status === 401) {
    return {
      icon: Lock,
      title: 'Session expirée',
      description: 'Votre session a expiré. Reconnectez-vous pour continuer.',
    }
  }
  if (status === 403) {
    return {
      icon: Ban,
      title: 'Accès refusé',
      description:
        "Vous n'avez pas le droit d'accéder à cette ressource. Demandez à un administrateur de vous accorder le rôle ou la permission nécessaire.",
    }
  }
  if (status === 404) {
    return {
      icon: SearchX,
      title: 'Introuvable',
      description: "Cet élément n'existe pas ou a été supprimé.",
    }
  }
  if (status !== undefined && status >= 500) {
    return {
      icon: ServerCrash,
      title: 'Erreur du serveur',
      description: 'Le serveur a rencontré un problème. Réessayez dans quelques instants.',
    }
  }
  return {
    icon: Ban,
    title: 'Requête refusée',
    description: `La demande n'a pas pu être traitée (code ${status}).`,
  }
}

/**
 * Full-width message shown in place of a page's content when loading fails.
 * Pass the thrown `error` (axios errors give their HTTP status), or a `status`
 * when there is no error object (e.g. an unknown URL).
 */
export function ApiErrorState({ error, status }: { error?: unknown; status?: number }) {
  let info: ErrorInfo
  if (status !== undefined) info = describe(status)
  else if (isAxiosError(error)) info = describe(error.response?.status ?? undefined, true)
  else info = { icon: Ban, title: 'Erreur', description: 'Une erreur est survenue pendant le chargement.' }
  const { icon: Icon, title, description } = info
  return (
    <div role='alert' className='flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center'>
      <Icon className='size-10 text-muted-foreground' aria-hidden />
      <h2 className='text-xl font-semibold'>{title}</h2>
      <p className='max-w-md text-muted-foreground'>{description}</p>
      <Button asChild variant='outline'>
        <Link to='/'>Retour à l’accueil</Link>
      </Button>
    </div>
  )
}
