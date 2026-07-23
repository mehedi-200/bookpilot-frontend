/**
 * Always a flex column with a growing body, so that when a card sits in a grid
 * row next to a taller sibling it stretches to match instead of leaving a
 * ragged bottom edge. Grid items stretch by default — never pass `items-start`
 * to a row of Cards.
 */
export default function Card({
  title,
  description,
  actions,
  className = '',
  bodyClassName = '',
  children,
}) {
  const hasHeader = title || description || actions

  return (
    <div
      className={`flex h-full flex-col rounded-xl border border-line bg-surface ${className}`}
    >
      {hasHeader && (
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold text-ink">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-ink-muted">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className={`flex-1 p-4 ${bodyClassName}`}>{children}</div>
    </div>
  )
}
