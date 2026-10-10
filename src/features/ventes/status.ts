import type { VenteStatus } from '@/features/types'

// Miroir de apps/ventes/workflow.py:VenteStatus (backend) — une seule
// source de vérité pour les libellés et les styles, pas un switch par écran.
export const VENTE_STATUS_LABELS: Record<VenteStatus, string> = {
  1: 'Brouillon',
  3: 'Validée (achat)',
  6: 'Validée (caisse)',
  9: 'Validée (DG)',
  [-1]: 'Annulée',
  [-3]: 'Rejetée (achat)',
  [-6]: 'Rejetée (caisse)',
  [-9]: 'Rejetée (DG)',
}

export const VENTE_STATUS_BADGE_VARIANT: Record<VenteStatus, string> = {
  1: 'bg-muted text-muted-foreground',
  3: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  6: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  9: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  [-1]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  [-3]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  [-6]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  [-9]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

export const VENTE_STATUS_FILTER_OPTIONS = (
  Object.entries(VENTE_STATUS_LABELS) as [string, string][]
).map(([value, label]) => ({ label, value }))

// Miroir de apps/ventes/workflow.py:VENTE_WORKFLOW — un libellé de bouton
// par étape. Les étapes réellement affichées viennent de `allowed_steps`
// (calculé côté serveur, selon le statut ET les permissions de
// l'utilisateur) : ce fichier ne décide de rien, il traduit juste un nom.
export const VENTE_STEP_LABELS: Record<string, string> = {
  valider_achat: 'Valider (achat)',
  rejeter_achat: 'Rejeter (achat)',
  valider_caisse: 'Valider (caisse)',
  rejeter_caisse: 'Rejeter (caisse)',
  valider_dg: 'Valider (DG)',
  rejeter_dg: 'Rejeter (DG)',
  annuler: 'Annuler',
}

export function venteStepLabel(step: string): string {
  return VENTE_STEP_LABELS[step] ?? step
}
