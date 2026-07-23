import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, CalendarCheck, Users, MessageSquare, X } from 'lucide-react'
import StatusChip, { STATUS_TONES } from '@/components/StatusChip'
import Spinner from '@/components/Spinner'
import { searchService } from '@/services/searchService'

const GROUPS = [
  { key: 'bookings', label: 'Bookings', icon: CalendarCheck, path: (r) => `/bookings/${r.id}` },
  { key: 'customers', label: 'Customers', icon: Users, path: (r) => `/customers/${r.id}` },
  {
    key: 'conversations',
    label: 'Conversations',
    icon: MessageSquare,
    path: (r) => `/conversations/${r.id}`,
  },
]

/** Debounced grouped search with keyboard navigation. Used in the desktop header. */
export default function MasterSearch() {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')
  const [debounced, setDebounced] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 250)
    return () => clearTimeout(timer)
  }, [term])

  // "/" focuses search from anywhere, the way every good tool does it.
  useEffect(() => {
    const onKey = (event) => {
      const typingElsewhere = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        document.activeElement?.tagName
      )
      if (event.key === '/' && !typingElsewhere) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const onClickAway = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [])

  const { data, isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => searchService.search(debounced),
    enabled: debounced.length >= 2,
    staleTime: 10_000,
  })

  // Flatten for arrow-key navigation across groups.
  const flat = GROUPS.flatMap((group) =>
    (data?.[group.key] ?? []).map((row) => ({ ...row, group }))
  )

  useEffect(() => setActive(0), [debounced])

  const go = (item) => {
    setOpen(false)
    setTerm('')
    navigate(item.group.path(item))
  }

  const onKeyDown = (event) => {
    if (!open || flat.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (i + 1) % flat.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (i - 1 + flat.length) % flat.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      go(flat[active])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  let cursor = -1

  return (
    <div ref={containerRef} className="relative w-full max-w-md shrink-0">
      <Search
        size={16}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
      />
      <input
        ref={inputRef}
        type="text"
        value={term}
        onChange={(event) => {
          setTerm(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search bookings, customers…  /"
        aria-label="Search"
        className="min-h-9 w-full rounded-lg border border-line bg-surface pr-8 pl-9 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
      />
      {term && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setTerm('')
            inputRef.current?.focus()
          }}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-muted hover:text-ink"
        >
          <X size={15} />
        </button>
      )}

      {open && debounced.length >= 2 && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
          {isFetching && !data ? (
            <div className="flex justify-center py-6">
              <Spinner size={18} />
            </div>
          ) : data?.total === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink-muted">
              No matches for “{debounced}”
            </p>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto py-1">
                {GROUPS.map((group) => {
                  const rows = data?.[group.key] ?? []
                  if (rows.length === 0) return null
                  const Icon = group.icon
                  return (
                    <div key={group.key}>
                      <p className="px-3 pt-2 pb-1 text-xs font-medium tracking-wide text-ink-muted uppercase">
                        {group.label}
                      </p>
                      {rows.map((row) => {
                        cursor += 1
                        const index = cursor
                        return (
                          <button
                            key={`${group.key}-${row.id}`}
                            type="button"
                            onMouseEnter={() => setActive(index)}
                            onClick={() => go({ ...row, group })}
                            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left ${
                              index === active ? 'bg-surface-2' : ''
                            }`}
                          >
                            <Icon size={15} className="shrink-0 text-ink-muted" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm text-ink">
                                {row.title}
                              </span>
                              <span className="block truncate text-xs text-ink-muted">
                                {row.reference ? `${row.reference} · ` : ''}
                                {row.subtitle}
                              </span>
                            </span>
                            {row.status && (
                              <StatusChip tone={STATUS_TONES[row.status]}>
                                {row.status === 'handed_off' ? 'needs a human' : row.status}
                              </StatusChip>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
              <p className="border-t border-line px-3 py-1.5 text-[11px] text-ink-muted">
                ↑↓ to navigate · Enter to open · Esc to close
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
