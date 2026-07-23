import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarCheck,
  Users,
  MessageSquare,
  SearchX,
  Clock,
} from 'lucide-react'
import Card from '@/components/Card'
import SearchInput from '@/components/SearchInput'
import EmptyState from '@/components/EmptyState'
import Skeleton from '@/components/Skeleton'
import StatusChip, { STATUS_TONES } from '@/components/StatusChip'
import { searchService } from '@/services/searchService'

const RECENT_KEY = 'bookpilot_recent_searches'

const GROUPS = [
  {
    key: 'bookings',
    label: 'Bookings',
    icon: CalendarCheck,
    path: (r) => `/bookings/${r.id}`,
  },
  {
    key: 'customers',
    label: 'Customers',
    icon: Users,
    path: (r) => `/customers/${r.id}`,
  },
  {
    key: 'conversations',
    label: 'Conversations',
    icon: MessageSquare,
    path: (r) => `/conversations/${r.id}`,
  },
]

/** Full-screen search — the mobile counterpart of the header dropdown. */
export default function Search() {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    } catch {
      return []
    }
  })

  const { data, isFetching } = useQuery({
    queryKey: ['search', term],
    queryFn: () => searchService.search(term),
    enabled: term.trim().length >= 2,
  })

  // Remember what was actually searched, once results come back.
  useEffect(() => {
    if (!data || data.total === 0 || term.trim().length < 2) return
    setRecent((current) => {
      const next = [
        term.trim(),
        ...current.filter((r) => r !== term.trim()),
      ].slice(0, 6)
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      } catch {
        // storage unavailable — recents are a nicety
      }
      return next
    })
  }, [data, term])

  const showResults = term.trim().length >= 2

  return (
    <div className="space-y-3">
      <SearchInput
        autoFocus
        placeholder="Search bookings, customers, chats…"
        value={term}
        onChange={setTerm}
        debounce={250}
      />

      {!showResults && recent.length > 0 && (
        <Card title="Recent searches">
          <div className="flex flex-wrap gap-2">
            {recent.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setTerm(entry)}
                className="flex min-h-9 items-center gap-1.5 rounded-full border border-line px-3 text-sm text-ink-muted"
              >
                <Clock size={13} />
                {entry}
              </button>
            ))}
          </div>
        </Card>
      )}

      {!showResults && recent.length === 0 && (
        <div className="rounded-xl border border-line bg-surface">
          <EmptyState
            icon={SearchX}
            title="Search everything"
            hint="Booking references, customer names, or a phone number — however it's written."
          />
        </div>
      )}

      {showResults && isFetching && !data && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {showResults && data?.total === 0 && (
        <div className="rounded-xl border border-line bg-surface">
          <EmptyState
            icon={SearchX}
            title={`No matches for “${term}”`}
            hint="Try a phone number or a booking reference."
          />
        </div>
      )}

      {showResults &&
        data?.total > 0 &&
        GROUPS.map((group) => {
          const rows = data[group.key] ?? []
          if (rows.length === 0) return null
          const Icon = group.icon
          return (
            <Card key={group.key} title={group.label}>
              <ul className="divide-y divide-line">
                {rows.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => navigate(group.path(row))}
                      className="flex w-full items-center gap-3 py-2.5 text-left"
                    >
                      <Icon size={16} className="shrink-0 text-ink-muted" />
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
                          {row.status === 'handed_off'
                            ? 'needs a human'
                            : row.status}
                        </StatusChip>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
    </div>
  )
}
