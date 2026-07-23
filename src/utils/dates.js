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

/** True when the timestamp falls on today's date. */
export function isToday(iso) {
  if (!iso) return false
  const date = new Date(iso)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function isPast(iso) {
  return iso ? new Date(iso).getTime() < Date.now() : false
}

export function timeLabel(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Y-m-d in local time — what the availability API expects. */
export function toDateParam(date) {
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

/** The next `count` days starting today, for the day strip. */
export function upcomingDays(count = 14) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    return date
  })
}

function startOfDay(d) {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}
