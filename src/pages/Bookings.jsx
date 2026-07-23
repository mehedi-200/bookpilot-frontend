import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, CalendarX, Bot, Hand, X } from 'lucide-react'
import DataList from '@/components/DataList'
import Button from '@/components/Button'
import SearchInput from '@/components/SearchInput'
import StatusChip, { STATUS_TONES } from '@/components/StatusChip'
import { Select } from '@/components/Field'
import { bookingService } from '@/services/bookingService'
import { catalogService } from '@/services/catalogService'
import { friendlyDateTime } from '@/utils/dates'
import NewBookingModal from '@/pages/bookings/NewBookingModal'

const STATUSES = ['', 'pending', 'confirmed', 'completed', 'cancelled']

export function SourceIcon({ source }) {
  const isAi = source === 'widget'
  const Icon = isAi ? Bot : Hand
  return (
    <span
      title={isAi ? 'Booked by AI' : 'Added manually'}
      className={`inline-flex items-center gap-1 text-xs ${isAi ? 'text-accent' : 'text-ink-muted'}`}
    >
      <Icon size={15} />
      {isAi ? 'AI' : 'Manual'}
    </span>
  )
}

export default function Bookings() {
  const navigate = useNavigate()
  // Dashboard stat cards and notifications deep-link into this page.
  const [searchParams] = useSearchParams()

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [status, setStatus] = useState(() => searchParams.get('status') ?? '')
  const [serviceId, setServiceId] = useState('')
  const [source, setSource] = useState(() => searchParams.get('source') ?? '')
  const [q, setQ] = useState(() => searchParams.get('q') ?? '')
  const [dateRange, setDateRange] = useState(() => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    return from || to
      ? { from, to, label: searchParams.get('label') ?? 'Date range' }
      : null
  })
  const [creating, setCreating] = useState(false)

  const params = {
    page,
    per_page: perPage,
    status: status || undefined,
    service_id: serviceId || undefined,
    source: source || undefined,
    q: q || undefined,
    from: dateRange?.from || undefined,
    to: dateRange?.to || undefined,
  }

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingService.list(params),
    placeholderData: (prev) => prev,
  })

  const { data: services } = useQuery({
    queryKey: ['services', { active: 1, per_page: 100 }],
    queryFn: () => catalogService.list({ active: 1, per_page: 100 }),
  })

  const reset = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const rows = data?.data ?? []

  return (
    <div className="space-y-3">
      {/* Status filter chips + any date filter arrived at via deep link */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => reset(setStatus)(s)}
            className={`min-h-9 rounded-full border px-3 text-sm font-medium capitalize transition-colors ${
              status === s
                ? 'border-accent bg-accent text-accent-contrast'
                : 'border-line text-ink-muted hover:text-ink'
            }`}
          >
            {s || 'All'}
          </button>
        ))}

        {dateRange && (
          <button
            type="button"
            onClick={() => reset(setDateRange)(null)}
            className="ml-auto flex min-h-9 items-center gap-1.5 rounded-full border border-accent bg-accent/10 px-3 text-sm font-medium text-accent"
          >
            {dateRange.label}
            <X size={14} />
          </button>
        )}
      </div>

      <DataList
        columns={[
          { key: 'reference', header: 'Ref', className: 'font-medium whitespace-nowrap' },
          {
            key: 'customer',
            header: 'Customer',
            render: (b) => b.customer?.name ?? '—',
          },
          {
            key: 'service',
            header: 'Service',
            className: 'text-ink-muted',
            render: (b) => b.service?.name ?? '—',
          },
          {
            key: 'starts_at',
            header: 'When',
            className: 'whitespace-nowrap',
            render: (b) => friendlyDateTime(b.starts_at),
          },
          {
            key: 'source',
            header: 'Source',
            render: (b) => <SourceIcon source={b.source} />,
          },
          {
            key: 'status',
            header: 'Status',
            render: (b) => (
              <StatusChip tone={STATUS_TONES[b.status]}>{b.status}</StatusChip>
            ),
          },
        ]}
        rows={rows}
        loading={isLoading}
        onRowClick={(b) => navigate(`/bookings/${b.id}`)}
        renderCard={(b) => (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink">{b.customer?.name ?? '—'}</p>
              <StatusChip tone={STATUS_TONES[b.status]}>{b.status}</StatusChip>
            </div>
            <p className="text-xs text-ink-muted">
              {b.reference} · {b.service?.name}
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-ink">{friendlyDateTime(b.starts_at)}</p>
              <SourceIcon source={b.source} />
            </div>
          </div>
        )}
        toolbar={
          <>
            <Button onClick={() => setCreating(true)}>
              <Plus size={16} /> New booking
            </Button>
            <div className="flex w-full flex-wrap items-center gap-2 md:ml-auto md:w-auto">
              <Select
                aria-label="Filter by service"
                value={serviceId}
                onChange={(e) => reset(setServiceId)(e.target.value)}
                className="w-40"
              >
                <option value="">All services</option>
                {(services?.data ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <Select
                aria-label="Filter by source"
                value={source}
                onChange={(e) => reset(setSource)(e.target.value)}
                className="w-32"
              >
                <option value="">Any source</option>
                <option value="widget">AI</option>
                <option value="manual">Manual</option>
              </Select>
              <SearchInput
                className="w-full md:w-56"
                placeholder="Ref, name or phone…"
                value={q}
                onChange={reset(setQ)}
              />
            </div>
          </>
        }
        empty={{
          icon: CalendarX,
          title: status
            ? `No ${status} bookings`
            : q
              ? `No bookings matching “${q}”`
              : 'No bookings yet',
          hint:
            status === 'pending'
              ? 'Nothing waiting on you right now 🎉'
              : status || q
                ? undefined
                : 'They appear here as soon as the AI books one — or add one yourself.',
          action: !status && !q && (
            <Button onClick={() => setCreating(true)}>
              <Plus size={16} /> New booking
            </Button>
          ),
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

      <NewBookingModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(booking) => {
          setCreating(false)
          navigate(`/bookings/${booking.id}`)
        }}
      />
    </div>
  )
}
