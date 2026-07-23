import { Link } from 'react-router-dom'
import {
  ArrowRight,
  MessageSquare,
  CalendarCheck,
  Clock,
  Bot,
  ShieldCheck,
  Wrench,
  Sparkles,
  Check,
} from 'lucide-react'
import Button from '@/components/Button'

export default function Landing() {
  return (
    <>
      <Hero />
      <LogosStrip />
      <Features />
      <HowItWorks />
      <ClosingCta />
    </>
  )
}

/* ── Hero ─────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft accent glow behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 mx-auto h-64 max-w-3xl blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in srgb, var(--accent) 28%, transparent), transparent)',
        }}
      />

      <div className="mx-auto max-w-4xl px-4 pt-16 pb-14 text-center sm:pt-24">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
          <Sparkles size={13} className="text-accent" />
          Powered by Claude
        </span>

        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Your AI receptionist that{' '}
          <span className="text-accent">books appointments</span> around the
          clock
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-ink-muted sm:text-lg">
          BookPilot chats with your customers, checks your real availability,
          and fills your calendar — while you get on with the work. No missed
          calls, no double bookings, no after-hours.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/login">
            <Button className="px-5">
              Start free <ArrowRight size={16} />
            </Button>
          </Link>
          <a href="#how">
            <Button variant="secondary" className="px-5">
              See how it works
            </Button>
          </a>
        </div>

        <p className="mt-3 text-xs text-ink-muted">
          No credit card needed · Live in minutes
        </p>

        <ChatPreview />
      </div>
    </section>
  )
}

// A little static mock of the widget, to show what customers see.
function ChatPreview() {
  return (
    <div className="mx-auto mt-12 max-w-md">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-contrast">
            <Sparkles size={15} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Rahim’s Garage</p>
            <p className="text-xs text-ink-muted">AI booking assistant</p>
          </div>
        </div>

        <div className="space-y-2.5 p-4">
          <Bubble>Hi! Can I book a full service for Saturday?</Bubble>
          <Bubble agent>
            Of course — I’ve got 9:00 AM or 2:30 PM free on Saturday. Which
            suits you?
          </Bubble>
          <Bubble>2:30 works</Bubble>
          <Bubble agent>
            Booked! You’re in at 2:30 PM Saturday. Your reference is
            BP-2026-0042.
          </Bubble>
        </div>
      </div>
    </div>
  )
}

function Bubble({ agent, children }) {
  return (
    <div className={`flex ${agent ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
          agent ? 'bg-surface-2 text-ink' : 'bg-accent text-accent-contrast'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

/* ── Social proof ─────────────────────────────────────────────────────── */

function LogosStrip() {
  const stats = [
    ['24/7', 'Always answering'],
    ['< 1 min', 'To go live'],
    ['0', 'Missed enquiries'],
    ['100%', 'Real availability'],
  ]

  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label} className="text-center">
            <p className="text-2xl font-semibold text-ink tabular-nums">
              {value}
            </p>
            <p className="mt-1 text-xs text-ink-muted">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Features ─────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Chats like a person',
    body: 'Customers ask in plain language. The AI answers, suggests times, and books — no forms, no phone tag.',
  },
  {
    icon: CalendarCheck,
    title: 'Never double-books',
    body: 'Every time it offers comes straight from your real calendar and working hours. The slot is locked the moment it’s taken.',
  },
  {
    icon: Clock,
    title: 'Works after hours',
    body: 'Most bookings happen when you’re closed. BookPilot answers at midnight so you wake up to a full day.',
  },
  {
    icon: ShieldCheck,
    title: 'You stay in control',
    body: 'Let the AI confirm instantly, or review each booking first. Read every conversation, step by step.',
  },
  {
    icon: Wrench,
    title: 'Fits your tools',
    body: 'Confirmed bookings sync into GarageFlow as service jobs automatically — no re-typing anything.',
  },
  {
    icon: Bot,
    title: 'Set up in minutes',
    body: 'Add your services and hours, paste one line onto your website, and the assistant is live.',
  },
]

function Features() {
  return (
    <section
      id="features"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
          Everything a receptionist does. None of the overheads.
        </h2>
        <p className="mt-3 text-ink-muted">
          BookPilot handles the back-and-forth so your calendar fills itself.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent/12 text-accent">
              <Icon size={19} />
            </span>
            <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
            <p className="mt-1.5 text-sm text-ink-muted">{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── How it works ─────────────────────────────────────────────────────── */

const STEPS = [
  {
    title: 'Add your services & hours',
    body: 'Tell BookPilot what you offer, how long each job takes, and when you’re open.',
  },
  {
    title: 'Drop in one line of code',
    body: 'Paste a single script tag onto your website. The chat widget appears — nothing else to build.',
  },
  {
    title: 'Watch the bookings roll in',
    body: 'Customers chat and book themselves. You review, confirm, and get on with the work.',
  },
]

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-16 border-y border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
            Live in three steps
          </h2>
          <p className="mt-3 text-ink-muted">
            No integrations to wrangle, no training required.
          </p>
        </div>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <span className="flex size-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-contrast">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ── Closing CTA ──────────────────────────────────────────────────────── */

function ClosingCta() {
  const points = ['Free to start', 'Live in minutes', 'Cancel anytime']

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface px-6 py-12 text-center sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 max-w-xl blur-3xl"
          style={{
            background:
              'radial-gradient(closest-side, color-mix(in srgb, var(--accent) 30%, transparent), transparent)',
          }}
        />
        <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
          Stop answering the phone. Start filling your calendar.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-ink-muted">
          Set BookPilot up once and let it book for you — day and night.
        </p>

        <div className="mt-7 flex justify-center">
          <Link to="/login">
            <Button className="px-6">
              Get started free <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-muted">
          {points.map((point) => (
            <li key={point} className="flex items-center gap-1.5">
              <Check size={15} className="text-ok" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
