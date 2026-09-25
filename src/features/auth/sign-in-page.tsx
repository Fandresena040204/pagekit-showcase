import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from './auth-layout'
import { fetchMe, login } from './api'

/**
 * Simplified port of poc-vente-front's `UserAuthForm`: same Card/AuthLayout
 * shell and real JWT flow (`login` -> `fetchMe`), but plain controlled
 * inputs instead of react-hook-form + zod (kept out of this POC's
 * dependency set) and no social-login buttons.
 */
export function SignInPage() {
  const { redirect } = useSearch({ from: '/sign-in' })
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const tokens = await login({ username, password })
      auth.setTokens(tokens.access, tokens.refresh)
      const user = await fetchMe()
      auth.setUser(user)
      return user
    },
    onSuccess: (user) => {
      toast.success(`Welcome back, ${user.username}!`)
      navigate({ to: redirect || '/', replace: true })
    },
    onError: () => {
      toast.error("Nom d'utilisateur ou mot de passe incorrect.")
    },
  })

  return (
    <AuthLayout>
      <Card className='max-w-sm gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Sign in</CardTitle>
          <CardDescription>Enter your username and password below to log into your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              mutate()
            }}
            className='grid gap-3'
          >
            <div className='grid gap-1.5'>
              <Label htmlFor='username'>Username</Label>
              <Input id='username' placeholder='admin' value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className='grid gap-1.5'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' type='password' placeholder='********' value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button className='mt-2' disabled={isPending}>
              {isPending ? <Loader2 className='animate-spin' /> : <LogIn />}
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
