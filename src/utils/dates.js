// Friendly date/time helpers — the ONLY way dates are shown in the UI.

export function friendlyDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  const today = new Date()
  const diffDays = Math.round(
    (startOfDay(date) - startOfDay(today)) / 86_400_000
  )

  if (diffDays === 0) return 'Today'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays === 1) return 'Tomorrow'

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  })
}

export function friendlyDateTime(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  return `${friendlyDate(iso)}, ${date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })}`
}

function startOfDay(d) {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}
