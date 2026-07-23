import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

// THE pagination component — the only one in the app (CLAUDE.md rule 7).
// Feed it a Laravel paginator meta: { current_page, last_page, total, per_page }.
export default function Pagination({
  meta,
  onPage,
  onPerPage,
  onRefresh,
  refreshing = false,
}) {
  if (!meta) return null
  const { current_page: page, last_page: last, total, per_page: perPage } = meta

  const pages = windowedPages(page, last)

  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2.5">
      {/* Desktop bar — fixed approved design */}
      <div className="hidden items-center gap-3 lg:flex">
        <button
          type="button"
          aria-label="Refresh"
          onClick={onRefresh}
          className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-contrast hover:opacity-90"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        </button>
        <span className="flex items-center gap-1.5 text-sm text-ink-muted">
          Showing
          <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold text-ink">
            {total}
          </span>
          entries
        </span>

        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm text-ink-muted">
            Show
            <select
              value={perPage}
              onChange={(e) => onPerPage?.(Number(e.target.value))}
              className="rounded-md border border-line bg-surface px-1.5 py-0.5 text-sm text-ink focus:border-accent focus:outline-none"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPage?.(page - 1)}
            className="text-sm font-medium text-accent disabled:opacity-40"
          >
            ‹ Previous
          </button>

          <div className="flex items-center gap-1">
            {pages.map((p, i) =>
              p === '…' ? (
                <span key={`gap-${i}`} className="px-1 text-sm text-ink-muted">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPage?.(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={
                    p === page
                      ? 'flex size-7 items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-contrast'
                      : 'flex size-7 items-center justify-center text-sm text-ink-muted hover:text-ink'
                  }
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            disabled={page >= last}
            onClick={() => onPage?.(page + 1)}
            className="text-sm font-medium text-accent disabled:opacity-40"
          >
            Next ›
          </button>
        </div>
      </div>

      {/* Mobile / tablet — compact app-style control */}
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <button
          type="button"
          aria-label="Refresh"
          onClick={onRefresh}
          className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-contrast"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPage?.(page - 1)}
          className="flex size-11 items-center justify-center rounded-lg border border-line text-ink disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm text-ink">
          <span className="font-semibold">{page}</span>
          <span className="text-ink-muted"> / {last || 1}</span>
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= last}
          onClick={() => onPage?.(page + 1)}
          className="flex size-11 items-center justify-center rounded-lg border border-line text-ink disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
        <select
          aria-label="Per page"
          value={perPage}
          onChange={(e) => onPerPage?.(Number(e.target.value))}
          className="min-h-11 rounded-lg border border-line bg-surface px-2 text-sm text-ink focus:outline-none"
        >
          {[10, 25, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function windowedPages(page, last) {
  if (!last || last <= 7)
    return Array.from({ length: last || 1 }, (_, i) => i + 1)
  const set = new Set(
    [1, 2, page - 1, page, page + 1, last - 1, last].filter(
      (p) => p >= 1 && p <= last
    )
  )
  const sorted = [...set].sort((a, b) => a - b)
  const out = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) out.push('…')
    out.push(p)
    prev = p
  }
  return out
}
