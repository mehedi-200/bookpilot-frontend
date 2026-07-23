const base =
  'w-full rounded-lg border border-line bg-surface px-3 text-base text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none disabled:opacity-50 lg:text-sm'

function Wrapper({ label, error, hint, children }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </span>
      )}
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
      {!error && hint && (
        <span className="mt-1 block text-xs text-ink-muted">{hint}</span>
      )}
    </label>
  )
}

export function Input({ label, error, hint, className = '', ref, ...props }) {
  return (
    <Wrapper label={label} error={error} hint={hint}>
      <input
        ref={ref}
        className={`${base} min-h-11 lg:min-h-9 ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
    </Wrapper>
  )
}

export function Select({
  label,
  error,
  hint,
  className = '',
  children,
  ref,
  ...props
}) {
  return (
    <Wrapper label={label} error={error} hint={hint}>
      <select
        ref={ref}
        className={`${base} min-h-11 lg:min-h-9 ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
    </Wrapper>
  )
}

export function Textarea({
  label,
  error,
  hint,
  className = '',
  rows = 3,
  ref,
  ...props
}) {
  return (
    <Wrapper label={label} error={error} hint={hint}>
      <textarea
        ref={ref}
        rows={rows}
        className={`${base} py-2.5 ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
    </Wrapper>
  )
}
