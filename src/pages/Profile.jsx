import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { Input } from '@/components/Field'
import PageHeader from '@/components/PageHeader'
import { useToast } from '@/components/Toast'
import { useAuth, applyServerErrors } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { authService } from '@/services/authService'

export default function Profile() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title="Profile" backTo="/" />
      <ProfileCard />
      <SecurityCard />
      <ThemeCard />
    </div>
  )
}

function ProfileCard() {
  const { user } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm({ defaultValues: { name: '', email: '' } })

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email })
  }, [user, reset])

  const mutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated)
      reset({ name: updated.name, email: updated.email })
      toast.success('Profile updated')
    },
    onError: (err) => {
      if (!applyServerErrors(err, setError)) toast.error('Could not save profile')
    },
  })

  return (
    <Card title="Profile">
      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4"
      >
        <Input
          label="Name"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <div className="flex justify-end">
          <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  )
}

function SecurityCard() {
  const { user } = useAuth()
  const toast = useToast()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm()

  const mutation = useMutation({
    mutationFn: (data) =>
      authService.updateProfile({ name: user.name, email: user.email, ...data }),
    onSuccess: () => {
      reset()
      toast.success('Password changed')
    },
    onError: (err) => {
      if (!applyServerErrors(err, setError)) toast.error('Could not change password')
    },
  })

  return (
    <Card title="Security">
      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4"
      >
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          error={errors.current_password?.message}
          {...register('current_password', { required: 'Enter your current password' })}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password', {
              required: 'Enter a new password',
              minLength: { value: 8, message: 'At least 8 characters' },
            })}
          />
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            error={errors.password_confirmation?.message}
            {...register('password_confirmation', { required: 'Confirm the new password' })}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={mutation.isPending}>
            Change password
          </Button>
        </div>
      </form>
    </Card>
  )
}

const THEME_PREVIEWS = {
  dark: { bg: '#0b0e14', surface: '#141a24', text: '#e7ebf3' },
  light: { bg: '#f4f5f8', surface: '#ffffff', text: '#1b2333' },
  reading: { bg: '#f3ebdd', surface: '#faf4e7', text: '#3a3126' },
}

function ThemeCard() {
  const { theme, setTheme, themes } = useTheme()

  return (
    <Card title="Theme">
      <div className="grid grid-cols-3 gap-3">
        {themes.map((t) => {
          const preview = THEME_PREVIEWS[t]
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`overflow-hidden rounded-xl border text-left transition-shadow ${
                theme === t ? 'border-accent ring-2 ring-accent/40' : 'border-line'
              }`}
            >
              {/* Mini mock of the app in that theme (real theme hexes, not UI colors) */}
              <div className="p-2.5" style={{ background: preview.bg }}>
                <div
                  className="rounded-md p-2"
                  style={{ background: preview.surface }}
                >
                  <div
                    className="mb-1 h-1.5 w-3/4 rounded-full"
                    style={{ background: preview.text, opacity: 0.85 }}
                  />
                  <div
                    className="h-1.5 w-1/2 rounded-full"
                    style={{ background: preview.text, opacity: 0.35 }}
                  />
                </div>
              </div>
              <p
                className={`px-2.5 py-1.5 text-xs font-medium capitalize ${
                  theme === t ? 'text-accent' : 'text-ink-muted'
                }`}
              >
                {t} {t === 'dark' && <span className="text-ink-muted">· default</span>}
              </p>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
