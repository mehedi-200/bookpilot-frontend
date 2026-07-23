import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Slim header for detail pages: compact `← Title` row (CLAUDE.md rule 8).
// List pages don't use a desktop title band at all.
export default function PageHeader({ title, subtitle, backTo, actions }) {
  const navigate = useNavigate()

  return (
    <div className="mb-3 flex items-center gap-2">
      {backTo && (
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(backTo)}
          className="flex size-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-2 hover:text-ink"
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <h1 className="text-base font-semibold text-ink">{title}</h1>
      {subtitle && <span className="text-sm text-ink-muted">{subtitle}</span>}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  )
}
