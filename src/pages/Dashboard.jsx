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
import BarChart from '@/components/charts/BarChart'
import DonutChart from '@/components/charts/DonutChart'
import { useAuth } from '@/hooks/useAuth'
import { dashboardService } from '@/services/dashboardService'
import { friendlyDate, timeLabel, toDateParam } from '@/utils/dates'

const STATUS_COLORS = {
  pending: 'var(--warn)',
  confirmed: 'var(--accent)',
  completed: 'var(--ok)',
  cancelled: 'var(--danger)',
}

export default function Dashboard() {
  const { user } = useAuth()
  const today = toDateParam(new Date())

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.get,
  })

  const ready = !isLoading && !!data

  return (
    <div className="space-y-3">
      <Greeting name={user?.name} />

      {ready && (
        <>
          <NeedsAttention needs={data.needs_attention} />
          <OnboardingStrip setup={data.setup_state} />
        </>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {!ready
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

      {/* Grid items stretch, so both cards in a row end at the same height */}
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityChart series={data?.series} loading={!ready} />
        </div>
        <AiShare share={data?.ai_share} loading={!ready} />
      </div>

      {/* Three equal columns — nothing short sits beside something long */}
      <div className="grid gap-3 lg:grid-cols-3">
        <TodaySchedule bookings={data?.today ?? []} loading={!ready} />
        <ComingUp bookings={data?.upcoming ?? []} loading={!ready} />
        <StatusBreakdown counts={data?.by_status} loading={!ready} />
      </div>
    </div>
  )
}

/* ── Header ───────────────────────────────────────────────────────────── */

function Greeting({ name }) {
  const hour = new Date().getHours()
  const part =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
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
  {
    key: 'business_configured',
    label: 'Business details',
    to: '/settings?tab=Business',
  },
  {
    key: 'hours_set',
    label: 'Working hours',
    to: '/settings?tab=Working hours',
  },
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
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-line bg-surface p-4">
      <div className="min-w-52 flex-1">
        <p className="text-sm font-medium text-ink">
          Finish setting up — {done} of {SETUP_STEPS.length} done
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
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

      <Link to={next.to}>
        <Button variant="secondary">
          {next.label} <ArrowRight size={15} />
        </Button>
      </Link>
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

/* ── Charts ───────────────────────────────────────────────────────────── */

function ActivityChart({ series, loading }) {
  if (loading) return <Skeleton className="h-72 w-full rounded-xl" />
  if (!series?.length) return null

  const total = series.reduce((sum, day) => sum + day.total, 0)

  return (
    <Card
      title="Booking activity"
      description="A week either side of today"
      actions={
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
            AI
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{
                background:
                  'color-mix(in srgb, var(--ink-muted) 45%, transparent)',
              }}
            />
            Manual
          </span>
        </div>
      }
    >
      {total === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No bookings in this window"
          hint="Activity shows up here as soon as bookings come in."
        />
      ) : (
        <BarChart data={series} height={190} />
      )}
    </Card>
  )
}

function AiShare({ share, loading }) {
  if (loading) return <Skeleton className="h-72 w-full rounded-xl" />
  if (!share) return null

  const total = share.ai + share.manual

  return (
    <Card title="AI share" description="Last 30 days">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <DonutChart
          size={150}
          segments={[
            { label: 'Booked by AI', value: share.ai, color: 'var(--accent)' },
            {
              label: 'Manual',
              value: share.manual,
              color: 'color-mix(in srgb, var(--ink-muted) 45%, transparent)',
            },
          ]}
        >
          <span className="text-2xl leading-none font-semibold text-ink tabular-nums">
            {share.percent}%
          </span>
          <span className="mt-1 text-[11px] text-ink-muted">by AI</span>
        </DonutChart>

        {total === 0 ? (
          <p className="text-center text-xs text-ink-muted">
            No bookings yet in this period.
          </p>
        ) : (
          <div className="grid w-full grid-cols-2 gap-2">
            <MiniStat
              icon={Bot}
              label="AI"
              value={share.ai}
              tone="var(--accent)"
            />
            <MiniStat
              icon={Hand}
              label="Manual"
              value={share.manual}
              tone="var(--ink-muted)"
            />
          </div>
        )}
      </div>
    </Card>
  )
}

function MiniStat({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-lg bg-surface-2 p-2.5 text-center">
      <p className="flex items-center justify-center gap-1.5 text-xs text-ink-muted">
        <Icon size={13} style={{ color: tone }} />
        {label}
      </p>
      <p className="mt-0.5 text-lg leading-none font-semibold text-ink tabular-nums">
        {value}
      </p>
    </div>
  )
}

function StatusBreakdown({ counts, loading }) {
  if (loading) return <Skeleton className="min-h-72 w-full rounded-xl" />
  if (!counts) return null

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0)

  return (
    <Card title="By status" description={`${total} bookings`}>
      {total === 0 ? (
        <EmptyState icon={CalendarX} title="No bookings yet" />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <DonutChart
            size={140}
            thickness={14}
            segments={Object.entries(counts).map(([status, value]) => ({
              label: status,
              value,
              color: STATUS_COLORS[status],
            }))}
          >
            <span className="text-2xl leading-none font-semibold text-ink tabular-nums">
              {total}
            </span>
            <span className="mt-1 text-[11px] text-ink-muted">total</span>
          </DonutChart>

          <ul className="grid w-full grid-cols-2 gap-x-3 gap-y-1.5">
            {Object.entries(counts).map(([status, count]) => (
              <li key={status}>
                <Link
                  to={`/bookings?status=${status}`}
                  className="flex items-center gap-2 text-xs text-ink-muted hover:text-ink"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: STATUS_COLORS[status] }}
                  />
                  <span className="capitalize">{status}</span>
                  <span className="ml-auto font-semibold text-ink tabular-nums">
                    {count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

/* ── Lists ────────────────────────────────────────────────────────────── */

function TodaySchedule({ bookings, loading }) {
  const navigate = useNavigate()

  if (loading) return <Skeleton className="min-h-72 w-full rounded-xl" />

  return (
    <Card
      bodyClassName={bookings.length > 0 ? 'p-0' : undefined}
      title="Today’s schedule"
      description={
        bookings.length === 0
          ? 'Nothing on the books'
          : `${bookings.length} ${bookings.length === 1 ? 'appointment' : 'appointments'}`
      }
      actions={
        <Link to="/bookings" className="text-xs text-accent hover:underline">
          View all
        </Link>
      }
    >
      {bookings.length === 0 ? (
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
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
              >
                <span className="w-14 shrink-0">
                  <span className="block text-sm font-semibold text-ink tabular-nums">
                    {timeLabel(booking.starts_at)}
                  </span>
                  <span className="block text-[11px] text-ink-muted">
                    {booking.service?.duration_minutes} min
                  </span>
                </span>

                <span
                  className="h-8 w-0.5 shrink-0 rounded-full"
                  style={{
                    background: STATUS_COLORS[booking.status] ?? 'var(--line)',
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
                  <Bot size={14} className="shrink-0 text-accent" />
                ) : (
                  <Hand size={14} className="shrink-0 text-ink-muted" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function ComingUp({ bookings, loading }) {
  if (loading) return <Skeleton className="min-h-72 w-full rounded-xl" />

  return (
    <Card
      bodyClassName={bookings.length > 0 ? 'p-0' : undefined}
      title="Coming up"
      description={
        bookings.length > 0 ? 'The next few appointments' : undefined
      }
    >
      {bookings.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="Nothing scheduled"
          hint="Future bookings will show up here."
        />
      ) : (
        <ul className="divide-y divide-line">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <Link
                to={`/bookings/${booking.id}`}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">
                    {booking.customer?.name ?? '—'}
                  </span>
                  <span className="block truncate text-xs text-ink-muted">
                    {booking.service?.name}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-xs font-medium text-ink">
                    {friendlyDate(booking.starts_at)}
                  </span>
                  <span className="block text-[11px] text-ink-muted tabular-nums">
                    {timeLabel(booking.starts_at)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
