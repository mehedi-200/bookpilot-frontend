import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import Button from '@/components/Button'

const PLANS = [
  {
    name: 'Starter',
    price: '৳0',
    cadence: 'to try it out',
    blurb: 'Everything you need to see BookPilot fill your calendar.',
    features: [
      'AI chat widget for your site',
      'Up to 50 bookings a month',
      'Real-time availability',
      'One team member',
    ],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Business',
    price: '৳1,500',
    cadence: 'per month',
    blurb: 'For shops that live and die by a full schedule.',
    features: [
      'Unlimited bookings',
      'Up to 10 team members',
      'GarageFlow sync',
      'Instant or reviewed confirmations',
      'Notifications & handoff to a human',
    ],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: 'Let’s talk',
    cadence: 'custom',
    blurb: 'Multiple locations, custom workflows, a hand getting set up.',
    features: [
      'Everything in Business',
      'Multiple locations',
      'Priority support',
      'Custom integrations',
    ],
    cta: 'Contact us',
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">
          Simple pricing that pays for itself
        </h1>
        <p className="mt-3 text-ink-muted">
          One booking BookPilot catches after hours usually covers the month.
          Start free, upgrade when it’s working for you.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex h-full flex-col rounded-2xl border bg-surface p-6 ${
              plan.highlighted ? 'border-accent shadow-lg' : 'border-line'
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-contrast">
                Most popular
              </span>
            )}

            <h2 className="text-sm font-semibold text-ink">{plan.name}</h2>
            <p className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-ink">
                {plan.price}
              </span>
              <span className="text-sm text-ink-muted">{plan.cadence}</span>
            </p>
            <p className="mt-2 text-sm text-ink-muted">{plan.blurb}</p>

            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-ink"
                >
                  <Check size={16} className="mt-0.5 shrink-0 text-ok" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link to="/login" className="mt-6">
              <Button
                variant={plan.highlighted ? 'primary' : 'secondary'}
                className="w-full"
              >
                {plan.cta}
                {plan.highlighted && <ArrowRight size={16} />}
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-ink-muted">
        All plans include the AI assistant, real-time availability, and the
        dashboard. Prices in BDT, billed monthly.
      </p>
    </section>
  )
}
