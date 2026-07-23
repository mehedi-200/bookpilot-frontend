export default function Avatar({ name, size = 'size-8' }) {
  const initials = (name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-ink`}
    >
      {initials}
    </span>
  )
}
