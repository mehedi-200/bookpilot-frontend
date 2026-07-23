import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-accent text-accent-contrast hover:opacity-90 disabled:opacity-50',
  secondary:
    'bg-surface-2 text-ink border border-line hover:bg-surface disabled:opacity-50',
  danger: 'bg-danger text-white hover:opacity-90 disabled:opacity-50',
  ghost: 'text-ink-muted hover:text-ink hover:bg-surface-2 disabled:opacity-50',
}

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors lg:min-h-9 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

export function IconButton({
  label,
  variant = 'ghost',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex size-11 items-center justify-center rounded-lg transition-colors lg:size-9 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
