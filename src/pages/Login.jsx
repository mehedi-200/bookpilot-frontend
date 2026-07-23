import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Rocket } from 'lucide-react'
import Button from '@/components/Button'
import { Input } from '@/components/Field'
import { setToken } from '@/services/api'

// Feature-1 stub: the layout is final, the submit is fake.
// Feature 2 replaces the submit with POST /api/login.
export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = (e) => {
    e.preventDefault()
    setToken('dev-preview-token')
    navigate(params.get('redirect') || '/', { replace: true })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-app p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-line bg-surface p-6 lg:p-8"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-contrast">
            <Rocket size={22} />
          </span>
          <h1 className="text-lg font-semibold text-ink">BookPilot</h1>
          <p className="text-sm text-ink-muted">Welcome back — sign in to continue</p>
        </div>

        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </div>
      </form>
    </div>
  )
}
