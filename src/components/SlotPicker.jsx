import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarOff } from 'lucide-react'
import Skeleton from '@/components/Skeleton'
import { bookingService } from '@/services/bookingService'
import { toDateParam, upcomingDays } from '@/utils/dates'

const GROUP_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
}

/**
 * Day strip + grouped slot chips. Shared by the new-booking flow and the
 * reschedule modal, so both always offer exactly what the engine says is free.
 */
export default function SlotPicker({ serviceId, value, onChange }) {
  const [date, setDate] = useState(() => toDateParam(new Date()))
  const days = upcomingDays(14)

  const { data, isLoading } = useQuery({
    queryKey: ['availability', serviceId, date],
    queryFn: () => bookingService.availability(serviceId, date),
    enabled: !!serviceId,
  })

  const pickDate = (next) => {
    setDate(next)
    onChange(null) // a new day invalidates the chosen slot
  }

  if (!serviceId) {
    return <p className="text-sm text-ink-muted">Pick a service to see available times.</p>
  }

  return (
    <div className="space-y-3">
      {/* 14-day strip */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {days.map((day) => {
          const param = toDateParam(day)
          const active = param === date
          return (
            <button
              key={param}
              type="button"
              onClick={() => pickDate(param)}
              className={`flex min-h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border text-xs transition-colors ${
                active
                  ? 'border-accent bg-accent text-accent-contrast'
                  : 'border-line text-ink-muted hover:text-ink'
              }`}
            >
              <span>{day.toLocaleDateString(undefined, { weekday: 'short' })}</span>
              <span className="text-base font-semibold">{day.getDate()}</span>
            </button>
          )
        })}
      </div>

      {/* Slots for the chosen day */}
      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-24 rounded-lg" />
          ))}
        </div>
      ) : data?.total === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 p-3 text-sm text-ink-muted">
          <CalendarOff size={16} />
          {data?.closed_reason ?? 'No free times left on this day.'}
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(GROUP_LABELS).map(([key, label]) => {
            const slots = data?.slots?.[key] ?? []
            if (slots.length === 0) return null
            return (
              <div key={key}>
                <p className="mb-1.5 text-xs font-medium tracking-wide text-ink-muted uppercase">
                  {label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => {
                    const selected = value === slot.start
                    return (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => onChange(slot.start)}
                        className={`min-h-11 rounded-lg border px-3 text-sm font-medium transition-colors ${
                          selected
                            ? 'border-accent bg-accent text-accent-contrast'
                            : 'border-line text-ink hover:border-accent'
                        }`}
                      >
                        {slot.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
