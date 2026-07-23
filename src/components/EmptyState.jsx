import { Inbox } from 'lucide-react'

// Every empty view says what to do next — never a blank table.
export default function EmptyState({
  icon: Icon = Inbox,
  title,
  hint,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-surface-2">
        <Icon size={22} className="text-ink-muted" />
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {hint && <p className="max-w-sm text-sm text-ink-muted">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
