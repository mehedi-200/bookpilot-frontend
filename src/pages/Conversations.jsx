import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare } from 'lucide-react'
import DataList from '@/components/DataList'
import SearchInput from '@/components/SearchInput'
import StatusChip, { STATUS_TONES } from '@/components/StatusChip'
import Avatar from '@/components/Avatar'
import { conversationService } from '@/services/conversationService'
import { friendlyDateTime } from '@/utils/dates'

const STATUSES = ['', 'active', 'handed_off', 'ended']
const STATUS_LABELS = {
  '': 'All',
  active: 'Active',
  handed_off: 'Needs a human',
  ended: 'Ended',
}

export default function Conversations() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [status, setStatus] = useState(() => searchParams.get('status') ?? '')
  const [q, setQ] = useState('')

  const params = {
    page,
    per_page: perPage,
    status: status || undefined,
    q: q || undefined,
  }

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['conversations', params],
    queryFn: () => conversationService.list(params),
    placeholderData: (prev) => prev,
    // Chats arrive while you're looking at the page.
    refetchInterval: 30_000,
  })

  const reset = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => reset(setStatus)(s)}
            className={`min-h-9 rounded-full border px-3 text-sm font-medium transition-colors ${
              status === s
                ? 'border-accent bg-accent text-accent-contrast'
                : 'border-line text-ink-muted hover:text-ink'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <DataList
        columns={[
          {
            key: 'contact_name',
            header: 'Customer',
            render: (c) => (
              <span className="flex items-center gap-2.5 font-medium">
                <Avatar name={c.contact_name} />
                <span>
                  {c.contact_name}
                  {c.phone && (
                    <span className="block text-xs font-normal text-ink-muted">
                      {c.phone}
                    </span>
                  )}
                </span>
              </span>
            ),
          },
          {
            key: 'preview',
            header: 'Last message',
            className: 'text-ink-muted max-w-xs',
            render: (c) => (
              <span className="block truncate">{c.preview ?? '—'}</span>
            ),
          },
          {
            key: 'bookings_count',
            header: 'Booked',
            render: (c) =>
              c.bookings_count > 0 ? (
                <span className="rounded-md bg-ok/15 px-2 py-0.5 text-xs font-semibold text-ok">
                  {c.bookings_count}
                </span>
              ) : (
                <span className="text-ink-muted">—</span>
              ),
          },
          {
            key: 'last_activity_at',
            header: 'Last activity',
            className: 'whitespace-nowrap text-ink-muted',
            render: (c) => friendlyDateTime(c.last_activity_at ?? c.started_at),
          },
          {
            key: 'status',
            header: 'Status',
            render: (c) => (
              <StatusChip tone={STATUS_TONES[c.status]}>
                {c.status === 'handed_off' ? 'needs a human' : c.status}
              </StatusChip>
            ),
          },
        ]}
        rows={data?.data ?? []}
        loading={isLoading}
        onRowClick={(c) => navigate(`/conversations/${c.id}`)}
        renderCard={(c) => (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-medium text-ink">
                <Avatar name={c.contact_name} />
                {c.contact_name}
              </p>
              <StatusChip tone={STATUS_TONES[c.status]}>
                {c.status === 'handed_off' ? 'needs a human' : c.status}
              </StatusChip>
            </div>
            <p className="truncate text-xs text-ink-muted">
              {c.preview ?? '—'}
            </p>
            <p className="text-xs text-ink-muted">
              {friendlyDateTime(c.last_activity_at ?? c.started_at)}
              {c.bookings_count > 0 && ` · ${c.bookings_count} booked`}
            </p>
          </div>
        )}
        toolbar={
          <SearchInput
            className="w-full md:ml-auto md:w-64"
            placeholder="Search name or phone…"
            value={q}
            onChange={reset(setQ)}
          />
        }
        empty={{
          icon: MessageSquare,
          title: status
            ? `No ${STATUS_LABELS[status].toLowerCase()} conversations`
            : 'No conversations yet',
          hint: status
            ? undefined
            : 'Chats appear here as soon as customers use your widget.',
        }}
        pagination={{
          meta: data?.meta,
          onPage: setPage,
          onPerPage: (n) => {
            setPerPage(n)
            setPage(1)
          },
          onRefresh: refetch,
          refreshing: isFetching,
        }}
      />
    </div>
  )
}
