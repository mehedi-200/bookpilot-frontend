import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, CalendarX, Bot, Hand, X, AlertTriangle } from 'lucide-react'
import DataList from '@/components/DataList'
import Button from '@/components/Button'
import SearchInput from '@/components/SearchInput'
import StatusChip, { STATUS_TONES } from '@/components/StatusChip'
import Avatar from '@/components/Avatar'
import { Select } from '@/components/Field'
import { bookingService } from '@/services/bookingService'
import { catalogService } from '@/services/catalogService'
import { friendlyDate, timeLabel, isToday } from '@/utils/dates'
import NewBookingModal from '@/pages/bookings/NewBookingModal'

const STATUSES = [
  ['', 'All'],
  ['pending', 'Pending'],
  ['confirmed', 'Confirmed'],
  ['completed', 'Completed'],
  ['cancelled', 'Cancelled'],
]

export function SourceIcon({ source, withLabel = true }) {
  const isAi = source === 'widget'
  const Icon = isAi ? Bot : Hand
  return (
    <span
      title={isAi ? 'Booked by the AI' : 'Added manually'}
      className={`inline-flex items-center gap-1.5 text-xs ${isAi ? 'text-accent' : 'text-ink-muted'}`}
    >
      <Icon size={15} />
      {withLabel && (isAi ? 'AI' : 'Manual')}
    </span>
  )
}

/** Day on top, time beneath — the pair reads as one thing at a glance. */
function When({ startsAt, status }) {
  const today = isToday(startsAt)
  const done = status === 'completed' || status === 'cancelled'

  return (
    <span className="block whitespace-nowrap">
      <span
        className={`block text-sm ${
          today
            ? 'font-semibold text-accent'
            : done
              ? 'text-ink-muted'
              : 'font-medium text-ink'
        }`}
      >
        {friendlyDate(startsAt)}
      </span>
      <span className="block text-xs text-ink-muted tabular-nums">
        {timeLabel(startsAt)}
      </span>
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

  const filtered = !!(status || q || source || serviceId || dateRange)

  return (
    <>
      <DataList
        columns={[
          {
            key: 'customer',
            header: 'Customer',
            render: (b) => (
              <span className="flex items-center gap-2.5">
                <Avatar name={b.customer?.name} />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 truncate font-medium text-ink">
                    {b.customer?.name ?? '—'}
                    {b.sync_status === 'failed' && (
                      <AlertTriangle
                        size={12}
                        className="shrink-0 text-danger"
                        title="Failed to sync to GarageFlow"
                      />
                    )}
                  </span>
                  <span className="block truncate text-xs text-ink-muted tabular-nums">
                    {b.reference}
                  </span>
                </span>
              </span>
            ),
          },
          {
            key: 'service',
            header: 'Service',
            render: (b) => (
              <span className="block">
                <span className="block text-ink">{b.service?.name ?? '—'}</span>
                <span className="block text-xs text-ink-muted">
                  {b.service?.duration_minutes} min
                </span>
              </span>
            ),
          },
          {
            key: 'starts_at',
            header: 'When',
            render: (b) => <When startsAt={b.starts_at} status={b.status} />,
          },
          {
            key: 'source',
            header: 'Source',
            render: (b) => <SourceIcon source={b.source} />,
          },
          {
            key: 'status',
            header: 'Status',
            className: 'text-right',
            render: (b) => (
              <StatusChip tone={STATUS_TONES[b.status]}>{b.status}</StatusChip>
            ),
          },
        ]}
        rows={data?.data ?? []}
        loading={isLoading}
        onRowClick={(b) => navigate(`/bookings/${b.id}`)}
        renderCard={(b) => (
          <div className="flex items-start gap-3">
            <Avatar name={b.customer?.name} size="size-9" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-medium text-ink">
                  {b.customer?.name ?? '—'}
                </p>
                <StatusChip tone={STATUS_TONES[b.status]}>
                  {b.status}
                </StatusChip>
              </div>
              <p className="truncate text-xs text-ink-muted">
                {b.reference} · {b.service?.name}
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span
                  className={`text-sm ${
                    isToday(b.starts_at)
                      ? 'font-semibold text-accent'
                      : 'text-ink'
                  }`}
                >
                  {friendlyDate(b.starts_at)}
                  <span className="text-ink-muted">
                    {' '}
                    · {timeLabel(b.starts_at)}
                  </span>
                </span>
                <SourceIcon source={b.source} withLabel={false} />
              </div>
            </div>
          </div>
        )}
        toolbar={
          <>
            <Button onClick={() => setCreating(true)}>
              <Plus size={16} /> New booking
            </Button>

            {/* Attached to the table, never floating above it */}
            <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1">
              {STATUSES.map(([value, label]) => (
                <button
                  key={value || 'all'}
                  type="button"
                  onClick={() => reset(setStatus)(value)}
                  className={`min-h-9 shrink-0 rounded-lg px-2.5 text-sm font-medium transition-colors ${
                    status === value
                      ? 'bg-accent text-accent-contrast'
                      : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {dateRange && (
              <button
                type="button"
                onClick={() => reset(setDateRange)(null)}
                className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-accent px-2.5 text-sm font-medium text-accent"
              >
                {dateRange.label}
                <X size={14} />
              </button>
            )}

            <div className="flex w-full flex-wrap items-center gap-2 md:ml-auto md:w-auto">
              <Select
                aria-label="Filter by service"
                value={serviceId}
                onChange={(e) => reset(setServiceId)(e.target.value)}
                className="w-36"
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
                className="w-28"
              >
                <option value="">Any source</option>
                <option value="widget">AI</option>
                <option value="manual">Manual</option>
              </Select>
              <SearchInput
                className="w-full md:w-52"
                placeholder="Ref, name or phone…"
                value={q}
                onChange={reset(setQ)}
              />
            </div>
          </>
        }
        empty={{
          icon: CalendarX,
          title:
            status === 'pending'
              ? 'Nothing waiting on you'
              : filtered
                ? 'No bookings match these filters'
                : 'No bookings yet',
          hint: filtered
            ? 'Try clearing a filter or searching for a phone number.'
            : 'They appear here as soon as the AI books one — or add one yourself.',
          action: !filtered && (
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
    </>
  )
}
