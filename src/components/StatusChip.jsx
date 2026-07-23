const tones = {
  ok: 'var(--ok)',
  warn: 'var(--warn)',
  danger: 'var(--danger)',
  accent: 'var(--accent)',
  grape: 'var(--grape)',
  neutral: 'var(--ink-muted)',
}

// Booking / conversation statuses → tone, in one place.
export const STATUS_TONES = {
  pending: 'warn',
  confirmed: 'accent',
  completed: 'ok',
  cancelled: 'danger',
  active: 'accent',
  ended: 'neutral',
  handed_off: 'grape',
  synced: 'ok',
  failed: 'danger',
}

export default function StatusChip({ tone = 'neutral', children }) {
  const color = tones[tone] ?? tones.neutral
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: color }}
        aria-hidden
      />
      {children}
    </span>
  )
}
