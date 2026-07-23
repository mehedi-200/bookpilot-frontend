/**
 * Stacked bars, one per day. Hand-rolled SVG rather than a chart library:
 * it's a few dozen lines, it uses the theme tokens directly, and it keeps the
 * bundle small.
 */
export default function BarChart({ data, height = 180 }) {
  const max = Math.max(1, ...data.map((d) => d.total))
  // A little headroom so the tallest bar never touches the top gridline.
  const scaleMax = Math.ceil(max * 1.15) || 1

  return (
    <div className="w-full">
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((day) => {
          const aiHeight = (day.ai / scaleMax) * 100
          const manualHeight = (day.manual / scaleMax) * 100
          const empty = day.total === 0

          return (
            <div
              key={day.date}
              className="group flex h-full min-w-0 flex-1 flex-col justify-end"
              title={`${day.label} ${day.day}: ${day.total} booking${day.total === 1 ? '' : 's'}`}
            >
              <span className="mb-1 block text-center text-[10px] text-ink-muted opacity-0 transition-opacity group-hover:opacity-100">
                {day.total}
              </span>

              <div
                className="flex w-full flex-col justify-end"
                style={{ height: '100%' }}
              >
                {empty ? (
                  <div
                    className="w-full rounded-sm bg-surface-2"
                    style={{ height: 3 }}
                  />
                ) : (
                  <>
                    <div
                      className="w-full rounded-t-sm transition-opacity group-hover:opacity-80"
                      style={{
                        height: `${aiHeight}%`,
                        background: 'var(--accent)',
                      }}
                    />
                    <div
                      className="w-full transition-opacity group-hover:opacity-80"
                      style={{
                        height: `${manualHeight}%`,
                        background:
                          'color-mix(in srgb, var(--ink-muted) 45%, transparent)',
                        borderBottomLeftRadius: 2,
                        borderBottomRightRadius: 2,
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex gap-1 border-t border-line pt-2">
        {data.map((day) => (
          <div key={day.date} className="min-w-0 flex-1 text-center">
            <span
              className={`block text-[10px] ${
                day.is_today ? 'font-semibold text-accent' : 'text-ink-muted'
              }`}
            >
              {day.label}
            </span>
            <span
              className={`block text-[10px] tabular-nums ${
                day.is_today
                  ? 'font-semibold text-accent'
                  : 'text-ink-muted opacity-60'
              }`}
            >
              {day.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
