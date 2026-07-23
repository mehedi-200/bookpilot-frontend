/**
 * Donut built from stroked SVG arcs. `segments` is [{ label, value, color }].
 * The centre is free for a headline number.
 */
export default function DonutChart({
  segments,
  size = 150,
  thickness = 16,
  children,
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius

  let offset = 0

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={thickness}
        />
        {total > 0 &&
          segments.map((segment) => {
            if (segment.value === 0) return null
            const fraction = segment.value / total
            const dash = fraction * circumference
            const element = (
              <circle
                key={segment.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              >
                <title>{`${segment.label}: ${segment.value}`}</title>
              </circle>
            )
            offset += dash
            return element
          })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}
