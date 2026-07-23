import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarDays,
  CalendarCheck,
  Clock3,
  Users,
  AlertTriangle,
  ArrowRight,
  Bot,
  Hand,
  Check,
  Sparkles,
  CalendarX,
} from 'lucide-react'
import Card from '@/components/Card'
import Button from '@/components/Button'
import EmptyState from '@/components/EmptyState'
import Skeleton, { StatCardSkeleton } from '@/components/Skeleton'
import StatusChip, { STATUS_TONES } from '@/components/StatusChip'
import { useAuth } from '@/hooks/useAuth'
import { dashboardService } from '@/services/dashboardService'
import { friendlyDateTime, timeLabel, toDateParam } from '@/utils/dates'

export default function Dashboard() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.get,
  })

  const today = toDateParam(new Date())

  return (
    <div className="space-y-3">
      <Greeting name={user?.name} loading={isLoading} />

      {!isLoading && data && (
        <>
          <OnboardingCard setup={data.setup_state} />
          <NeedsAttention needs={data.needs_attention} />
        </>
      )}

      {/* Stats — every number is a link to the list that explains it */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={CalendarDays}
              label="Today"
              value={data.stats.today}
              to={`/bookings?from=${today}&to=${today}&label=Today`}
            />
            <StatCard
              icon={CalendarCheck}
              label="Next 7 days"
              value={data.stats.week}
              to={`/bookings?from=${today}&label=Next 7 days`}
            />
            <StatCard
              icon={Clock3}
              label="Pending"
              value={data.stats.pending}
              tone={data.stats.pending > 0 ? 'warn' : undefined}
              to="/bookings?status=pending"
            />
            <StatCard
              icon={Users}
              label="Customers"
              value={data.stats.customers}
              to="/customers"
            />
          </>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodaySchedule bookings={data?.today ?? []} loading={isLoading} />
        </div>
        <div className="space-y-3">
          <AiShare share={data?.ai_share} loading={isLoading} />
          <StatusBreakdown counts={data?.by_status} loading={isLoading} />
          <Upcoming bookings={data?.upcoming ?? []} loading={isLoading} />
        </div>
      </div>
    </div>
  )
}

/* ── Pieces ───────────────────────────────────────────────────────────── */

function Greeting({ name, loading }) {
  const hour = new Date().getHours()
  const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const date = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <h1 className="text-base font-semibold text-ink">
        {part}
        {name ? `, ${name.split(' ')[0]}` : ''}
      </h1>
      {loading ? (
        <Skeleton className="h-4 w-40" />
      ) : (
        <span className="text-sm text-ink-muted">{date}</span>
      )}
    </div>
  )
}

const SETUP_STEPS = [
  { key: 'business_configured', label: 'Add your business details', to: '/settings?tab=Business' },
  { key: 'hours_set', label: 'Set your working hours', to: '/settings?tab=Working hours' },
  { key: 'has_services', label: 'Add the services you offer', to: '/services' },
  { key: 'widget_embedded', label: 'Embed the chat widget', to: '/settings?tab=Widget' },
]

function OnboardingCard({ setup }) {
  if (!setup) return null
  const done = SETUP_STEPS.filter((step) => setup[step.key]).length
  if (done === SETUP_STEPS.length) return null // disappears for good once complete

  const next = SETUP_STEPS.find((step) => !setup[step.key])

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <Sparkles size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">
            Finish setting up BookPilot ({done}/{SETUP_STEPS.length})
          </p>
          <p className="text-sm text-ink-muted">
            Next: {next.label} — your AI can only book what it knows about.
          </p>
        </div>
        <Link to={next.to}>
          <Button>
            {next.label} <ArrowRight size={15} />
          </Button>
        </Link>
      </div>

      <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {SETUP_STEPS.map((step) => {
          const complete = setup[step.key]
          return (
            <li key={step.key}>
              <Link
                to={step.to}
                className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs transition-colors ${
                  complete
                    ? 'border-line text-ink-muted'
                    : 'border-line text-ink hover:border-accent'
                }`}
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
                    complete ? 'bg-ok text-white' : 'border border-line text-ink-muted'
                  }`}
                >
                  {complete ? <Check size={12} /> : ''}
                </span>
                <span className={complete ? 'line-through' : ''}>{step.label}</span>
              </Link>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}

function NeedsAttention({ needs }) {
  if (!needs) return null
  const items = [
    {
      count: needs.pending,
      label: needs.pending === 1 ? 'booking waiting for confirmation' : 'bookings waiting for confirmation',
      to: '/bookings?status=pending',
    },
    {
      count: needs.handoffs,
      label: needs.handoffs === 1 ? 'conversation needs a human' : 'conversations need a human',
      to: '/conversations?status=handed_off',
    },
    {
      count: needs.failed_syncs,
      label: needs.failed_syncs === 1 ? 'booking failed to sync' : 'bookings failed to sync',
      to: '/bookings',
    },
  ].filter((item) => item.count > 0)

  if (items.length === 0) return null // only ever rendered when it matters

  return (
    <div className="rounded-xl border border-line border-l-4 border-l-warn bg-surface p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
        <AlertTriangle size={16} className="text-warn" />
        Needs your attention
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              to={item.to}
              className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink"
            >
              <span className="font-semibold text-ink">{item.count}</span>
              {item.label}
              <ArrowRight size={13} className="opacity-60" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, to, tone }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent"
    >
      <p className="flex items-center gap-1.5 text-xs text-ink-muted">
        <Icon size={14} />
        {label}
      </p>
      <p
        className={`mt-1.5 text-2xl font-semibold ${tone === 'warn' ? 'text-warn' : 'text-ink'}`}
      >
        {value}
      </p>
    </Link>
  )
}

function TodaySchedule({ bookings, loading }) {
  const navigate = useNavigate()

  return (
    <Card title="Today’s schedule">
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="Nothing booked today"
          hint="Free day — or time to share your booking link."
        />
      ) : (
        <ul className="divide-y divide-line">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <button
                type="button"
                onClick={() => navigate(`/bookings/${booking.id}`)}
                className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-surface-2"
              >
                <span className="w-20 shrink-0 text-sm font-medium text-ink tabular-nums">
                  {timeLabel(booking.starts_at)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">
                    {booking.customer?.name ?? '—'}
                  </span>
                  <span className="block truncate text-xs text-ink-muted">
                    {booking.service?.name}
                  </span>
                </span>
                {booking.source === 'widget' ? (
                  <Bot size={15} className="shrink-0 text-accent" title="Booked by AI" />
                ) : (
                  <Hand size={15} className="shrink-0 text-ink-muted" title="Added manually" />
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

function AiShare({ share, loading }) {
  if (loading) return <Skeleton className="h-28 w-full rounded-xl" />
  if (!share) return null

  const total = share.ai + share.manual

  return (
    <Card title="AI vs manual">
      {total === 0 ? (
        <p className="text-sm text-ink-muted">
          No bookings in the last 30 days yet — once your widget is live this shows how much
          the AI handles for you.
        </p>
      ) : (
        <>
          <p className="text-sm text-ink">
            <span className="font-semibold text-accent">{share.percent}%</span> of the last 30
            days’ bookings were made by your AI.
          </p>
          <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="bg-accent" style={{ width: `${share.percent}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Bot size={13} className="text-accent" /> AI {share.ai}
            </span>
            <span className="flex items-center gap-1.5">
              <Hand size={13} /> Manual {share.manual}
            </span>
          </div>
        </>
      )}
    </Card>
  )
}

function StatusBreakdown({ counts, loading }) {
  if (loading) return <Skeleton className="h-40 w-full rounded-xl" />
  if (!counts) return null

  return (
    <Card title="All bookings">
      <ul className="space-y-1">
        {Object.entries(counts).map(([status, count]) => (
          <li key={status}>
            <Link
              to={`/bookings?status=${status}`}
              className="flex items-center gap-2 rounded-lg px-1 py-1.5 text-sm hover:bg-surface-2"
            >
              <StatusChip tone={STATUS_TONES[status]}>{status}</StatusChip>
              <span className="ml-auto font-semibold text-ink tabular-nums">{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function Upcoming({ bookings, loading }) {
  if (loading) return <Skeleton className="h-32 w-full rounded-xl" />
  if (bookings.length === 0) return null

  return (
    <Card title="Coming up">
      <ul className="space-y-1">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <Link
              to={`/bookings/${booking.id}`}
              className="flex items-center gap-2 rounded-lg px-1 py-1.5 text-sm hover:bg-surface-2"
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
