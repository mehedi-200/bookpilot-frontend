import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Rocket, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Button from '@/components/Button'
import { Input } from '@/components/Field'
import { useAuth } from '@/hooks/useAuth'

const EMAIL_KEY = 'bookpilot_login_email'

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { login } = useAuth()

  const [email, setEmail] = useState(
    () => localStorage.getItem(EMAIL_KEY) ?? ''
  )
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      localStorage.setItem(EMAIL_KEY, email)
      navigate(params.get('redirect') || '/', { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.errors?.email?.[0] ??
          err.response?.data?.message ??
          'Could not sign in — check your connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-app p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-line bg-surface p-6 lg:p-8"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Link
            to="/welcome"
            className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-contrast"
          >
            <Rocket size={22} />
          </Link>
          <h1 className="text-lg font-semibold text-ink">BookPilot</h1>
          <p className="text-sm text-ink-muted">
            Welcome back — sign in to continue
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
            autoComplete="email"
          />
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 bottom-2.5 text-ink-muted hover:text-ink lg:bottom-2"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Sign in
          </Button>
        </div>
      </form>
    </div>
  )
}
