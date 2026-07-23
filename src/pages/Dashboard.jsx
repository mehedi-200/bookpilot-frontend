import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarDays,
  CalendarRange,
  Clock3,
  Users,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Hand,
  Check,
  Plus,
  CalendarX,
} from 'lucide-react'
import Card from '@/components/Card'
import Button from '@/components/Button'
import EmptyState from '@/components/EmptyState'
import Skeleton from '@/components/Skeleton'
import StatusChip, { STATUS_TONES } from '@/components/StatusChip'
import { useAuth } from '@/hooks/useAuth'
import { dashboardService } from '@/services/dashboardService'
import { friendlyDateTime, timeLabel, toDateParam } from '@/utils/dates'

export default function Dashboard() {
  const { user } = useAuth()
  const today = toDateParam(new Date())

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.get,
  })

  return (
    <div className="space-y-4">
      <Greeting name={user?.name} />

      {!isLoading && data && (
        <>
          <NeedsAttention needs={data.needs_attention} />
          <OnboardingStrip setup={data.setup_state} />
        </>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* `data` is also missing when the request failed, not just while loading */}
        {isLoading || !data
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : [
              {
                icon: CalendarDays,
                tone: 'var(--accent)',
                value: data.stats.today,
                label: 'Booked today',
                to: `/bookings?from=${today}&to=${today}&label=Today`,
              },
              {
                icon: CalendarRange,
                tone: 'var(--grape)',
                value: data.stats.week,
                label: 'Next 7 days',
                to: `/bookings?from=${today}&label=Next 7 days`,
              },
              {
                icon: Clock3,
                tone: 'var(--warn)',
                value: data.stats.pending,
                label: 'Awaiting confirmation',
                to: '/bookings?status=pending',
              },
              {
                icon: Users,
                tone: 'var(--ok)',
                value: data.stats.customers,
                label: 'Customers',
                to: '/customers',
              },
            ].map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TodaySchedule bookings={data?.today ?? []} loading={isLoading} />
        </div>
        <div className="space-y-3 lg:col-span-2">
          <AiPerformance share={data?.ai_share} loading={isLoading} />
          <BookingMix counts={data?.by_status} loading={isLoading} />
          <ComingUp bookings={data?.upcoming ?? []} loading={isLoading} />
        </div>
      </div>
    </div>
  )
}

/* ── Header ───────────────────────────────────────────────────────────── */

function Greeting({ name }) {
  const hour = new Date().getHours()
  const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const date = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-ink">
          {part}
          {name ? `, ${name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-ink-muted">{date}</p>
      </div>
      <Link to="/bookings" className="ml-auto">
        <Button>
          <Plus size={16} /> New booking
        </Button>
      </Link>
    </div>
  )
}

/* ── Attention & onboarding ───────────────────────────────────────────── */

function NeedsAttention({ needs }) {
  const items = [
    {
      count: needs?.pending ?? 0,
      one: 'booking to confirm',
      many: 'bookings to confirm',
      to: '/bookings?status=pending',
    },
    {
      count: needs?.handoffs ?? 0,
      one: 'chat needs a human',
      many: 'chats need a human',
      to: '/conversations?status=handed_off',
    },
    {
      count: needs?.failed_syncs ?? 0,
      one: 'booking failed to sync',
      many: 'bookings failed to sync',
      to: '/bookings',
    },
  ].filter((item) => item.count > 0)

  if (items.length === 0) return null

  return (
    <div
      className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border p-3.5"
      style={{
        borderColor: 'color-mix(in srgb, var(--warn) 35%, transparent)',
        background: 'color-mix(in srgb, var(--warn) 8%, var(--surface))',
      }}
    >
      <span className="flex items-center gap-2 text-sm font-medium text-ink">
        <AlertTriangle size={16} className="text-warn" />
        Needs your attention
      </span>
      {items.map((item) => (
        <Link
          key={item.one}
          to={item.to}
          className="group flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          <span className="font-semibold text-ink">{item.count}</span>
          {item.count === 1 ? item.one : item.many}
          <ArrowRight
            size={13}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      ))}
    </div>
  )
}

const SETUP_STEPS = [
  { key: 'business_configured', label: 'Business details', to: '/settings?tab=Business' },
  { key: 'hours_set', label: 'Working hours', to: '/settings?tab=Working hours' },
  { key: 'has_services', label: 'Services', to: '/services' },
  { key: 'widget_embedded', label: 'Embed widget', to: '/settings?tab=Widget' },
]

function OnboardingStrip({ setup }) {
  if (!setup) return null

  const done = SETUP_STEPS.filter((step) => setup[step.key]).length
  if (done === SETUP_STEPS.length) return null

  const next = SETUP_STEPS.find((step) => !setup[step.key])
  const percent = Math.round((done / SETUP_STEPS.length) * 100)

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">
            Finish setting up — {done} of {SETUP_STEPS.length} done
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">
            Your AI can only book what it knows about.
          </p>
        </div>
        <Link to={next.to}>
          <Button variant="secondary">
            {next.label} <ArrowRight size={15} />
          </Button>
        </Link>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {SETUP_STEPS.map((step) => {
          const complete = setup[step.key]
          return (
            <li key={step.key}>
              <Link
                to={step.to}
                className={`flex items-center gap-1.5 text-xs ${
                  complete ? 'text-ink-muted' : 'text-ink hover:text-accent'
                }`}
              >
                <span
                  className={`flex size-4 items-center justify-center rounded-full ${
                    complete ? 'bg-ok text-white' : 'border border-line'
                  }`}
                >
                  {complete && <Check size={10} strokeWidth={3} />}
                </span>
                {step.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ── Stats ────────────────────────────────────────────────────────────── */

function StatCard({ icon: Icon, tone, value, label, to }) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent"
    >
      <div className="flex items-start justify-between">
        <span
          className="flex size-9 items-center justify-center rounded-lg"
          style={{
            color: tone,
            background: `color-mix(in srgb, ${tone} 14%, transparent)`,
          }}
        >
          <Icon size={17} />
        </span>
        <ArrowUpRight
          size={15}
          className="text-ink-muted opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
      <p className="mt-3 text-2xl leading-none font-semibold text-ink tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-xs text-ink-muted">{label}</p>
    </Link>
  )
}

function StatSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <Skeleton className="size-9 rounded-lg" />
      <Skeleton className="mt-3 h-7 w-12" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  )
}

/* ── Today ────────────────────────────────────────────────────────────── */

function TodaySchedule({ bookings, loading }) {
  const navigate = useNavigate()

  return (
    <Card
      title="Today’s schedule"
      description={
        loading
          ? undefined
          : bookings.length === 0
            ? 'Nothing on the books'
            : `${bookings.length} ${bookings.length === 1 ? 'appointment' : 'appointments'}`
      }
      actions={
        <Link to="/bookings" className="text-xs text-accent hover:underline">
          View all
        </Link>
      }
      bodyClassName={bookings.length > 0 && !loading ? 'p-0' : undefined}
    >
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="Nothing booked today"
          hint="A free day — or a good day to share your booking link."
        />
      ) : (
        <ul className="divide-y divide-line">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <button
                type="button"
                onClick={() => navigate(`/bookings/${booking.id}`)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2"
              >
                {/* Time rail — the times line up so the day reads vertically */}
                <span className="flex w-16 shrink-0 flex-col items-start">
                  <span className="text-sm font-semibold text-ink tabular-nums">
                    {timeLabel(booking.starts_at)}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {booking.service?.duration_minutes} min
                  </span>
                </span>

                <span
                  className="h-9 w-0.5 shrink-0 rounded-full"
                  style={{
                    background: `color-mix(in srgb, var(--${
                      booking.status === 'confirmed' ? 'accent' : 'warn'
                    }) 55%, transparent)`,
                  }}
                />

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {booking.customer?.name ?? '—'}
                  </span>
                  <span className="block truncate text-xs text-ink-muted">
                    {booking.service?.name}
                  </span>
                </span>

                {booking.source === 'widget' ? (
                  <Bot size={15} className="shrink-0 text-accent" />
                ) : (
                  <Hand size={15} className="shrink-0 text-ink-muted" />
                )}
                <StatusChip tone={STATUS_TONES[booking.status]}>{booking.status}</StatusChip>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

/* ── Right column ─────────────────────────────────────────────────────── */

function AiPerformance({ share, loading }) {
  if (loading) return <Skeleton className="h-40 w-full rounded-xl" />
  if (!share) return null

  const total = share.ai + share.manual

  return (
    <Card title="AI performance" description="Last 30 days">
      {total === 0 ? (
        <p className="text-sm text-ink-muted">
          Once your widget is live, this shows how much of the booking work the AI
          handles for you.
        </p>
      ) : (
        <>
          <div className="flex items-end gap-2">
            <span className="text-3xl leading-none font-semibold text-accent tabular-nums">
              {share.percent}%
            </span>
            <span className="pb-0.5 text-sm text-ink-muted">booked by AI</span>
          </div>

          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="bg-accent transition-[width]"
              style={{ width: `${share.percent}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <MiniStat icon={Bot} label="By AI" value={share.ai} tone="var(--accent)" />
            <MiniStat icon={Hand} label="Manual" value={share.manual} tone="var(--ink-muted)" />
          </div>
        </>
      )}
    </Card>
  )
}

function MiniStat({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-lg bg-surface-2 p-2.5">
      <p className="flex items-center gap-1.5 text-xs text-ink-muted">
        <Icon size={13} style={{ color: tone }} />
        {label}
      </p>
      <p className="mt-0.5 text-lg leading-none font-semibold text-ink tabular-nums">
        {value}
      </p>
    </div>
  )
}

const MIX_TONES = {
  pending: 'var(--warn)',
  confirmed: 'var(--accent)',
  completed: 'var(--ok)',
  cancelled: 'var(--danger)',
}

function BookingMix({ counts, loading }) {
  if (loading) return <Skeleton className="h-36 w-full rounded-xl" />
  if (!counts) return null

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0)

  return (
    <Card title="All bookings" description={`${total} in total`}>
      {total === 0 ? (
        <p className="text-sm text-ink-muted">No bookings yet.</p>
      ) : (
        <>
          {/* One bar, four segments — proportions at a glance */}
          <div className="flex h-2 overflow-hidden rounded-full bg-surface-2">
            {Object.entries(counts).map(([status, count]) =>
              count === 0 ? null : (
                <div
                  key={status}
                  title={`${status}: ${count}`}
                  style={{
                    width: `${(count / total) * 100}%`,
                    background: MIX_TONES[status],
                  }}
                />
              )
            )}
          </div>

          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {Object.entries(counts).map(([status, count]) => (
              <li key={status}>
                <Link
                  to={`/bookings?status=${status}`}
                  className="flex items-center gap-2 text-xs text-ink-muted hover:text-ink"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: MIX_TONES[status] }}
                  />
                  <span className="capitalize">{status}</span>
                  <span className="ml-auto font-semibold text-ink tabular-nums">
                    {count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  )
}

function ComingUp({ bookings, loading }) {
  if (loading) return <Skeleton className="h-32 w-full rounded-xl" />
  if (bookings.length === 0) return null

  return (
    <Card title="Coming up" bodyClassName="p-0">
      <ul className="divide-y divide-line">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <Link
              to={`/bookings/${booking.id}`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-surface-2"
            >
              <span className="min-w-0 flex-1 truncate text-ink">
                {booking.customer?.name ?? '—'}
              </span>
              <span className="shrink-0 text-xs text-ink-muted">
                {friendlyDateTime(booking.starts_at)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}
