import { Toaster as Sonner, type ToasterProps } from 'sonner'

// Simplified from poc-vente-front's version: no theme-provider context here
// (this POC doesn't replicate the dark/light toggle), fixed to 'system'.
export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme='system'
      className='toaster group [&_div[data-content]]:w-full'
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}
