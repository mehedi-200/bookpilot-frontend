// A stable colour per person, drawn from theme tokens so it works in all three
// themes. Same name always gets the same tint, which makes lists scannable.
const TONES = ['var(--accent)', 'var(--grape)', 'var(--ok)', 'var(--warn)']

function toneFor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return TONES[hash % TONES.length]
}

export default function Avatar({ name, size = 'size-8', className = '' }) {
  const label = name ?? '?'
  const initials = label
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const tone = toneFor(label)

  return (
    <span
      aria-hidden
      className={`flex ${size} shrink-0 items-center justify-center rounded-full text-xs font-semibold ${className}`}
      style={{
        color: tone,
        background: `color-mix(in srgb, ${tone} 15%, transparent)`,
      }}
    >
      {initials}
    </span>
  )
}
