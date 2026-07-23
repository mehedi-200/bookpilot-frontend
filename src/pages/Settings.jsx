import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Copy, Check, Eye, EyeOff, RefreshCw, Trash2, CalendarOff } from 'lucide-react'
import Card from '@/components/Card'
import Button, { IconButton } from '@/components/Button'
import { Input, Select } from '@/components/Field'
import Switch from '@/components/Switch'
import ConfirmModal from '@/components/ConfirmModal'
import Spinner from '@/components/Spinner'
import { useToast } from '@/components/Toast'
import { applyServerErrors } from '@/hooks/useAuth'
import { businessService, workingHoursService } from '@/services/businessService'
import { friendlyDate } from '@/utils/dates'

const TABS = ['Business', 'Working hours', 'Widget']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function Settings() {
  const [tab, setTab] = useState('Business')

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Tabs: horizontal (desktop) / segmented (mobile) — same control */}
      <div className="flex rounded-xl border border-line bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`min-h-9 flex-1 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-accent text-accent-contrast' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Business' && <BusinessTab />}
      {tab === 'Working hours' && <HoursTab />}
      {tab === 'Widget' && <WidgetTab />}
    </div>
  )
}

/* ── Business ─────────────────────────────────────────────────────────── */

function BusinessTab() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['business'],
    queryFn: businessService.get,
  })
  const business = data?.business

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      auto_confirm: false,
    },
  })

  useEffect(() => {
    if (business) {
      reset({
        name: business.name,
        phone: business.phone ?? '',
        email: business.email ?? '',
        address: business.address ?? '',
        timezone: business.timezone,
        auto_confirm: business.auto_confirm,
      })
    }
  }, [business, reset])

  const mutation = useMutation({
    mutationFn: (form) =>
      businessService.update({
        ...form,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] })
      toast.success('Business settings saved')
    },
    onError: (err) => {
      if (!applyServerErrors(err, setError)) toast.error('Could not save settings')
    },
  })

  const autoConfirm = watch('auto_confirm')

  if (isLoading) return <CenteredSpinner />

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <Card title="Business profile">
        <div className="space-y-4">
          <Input
            label="Business name"
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <Input label="Phone" placeholder="01712-345678" {...register('phone')} />
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          </div>
          <Input label="Address" {...register('address')} />
          <Select label="Timezone" error={errors.timezone?.message} {...register('timezone')}>
            {Intl.supportedValuesOf('timeZone').map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card title="AI booking behaviour">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">
              {autoConfirm ? 'Instant confirmation' : 'Review before confirming'}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {autoConfirm
                ? 'The AI confirms bookings immediately — customers get a definite “you’re booked”.'
                : 'AI bookings arrive as Pending — you confirm each one before it’s final.'}
            </p>
          </div>
          <Switch
            checked={autoConfirm}
            label="Auto-confirm AI bookings"
            onChange={(next) => setValue('auto_confirm', next, { shouldDirty: true })}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={mutation.isPending}>
          Save changes
        </Button>
      </div>
    </form>
  )
}

/* ── Working hours ────────────────────────────────────────────────────── */

function HoursTab() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['working-hours'],
    queryFn: workingHoursService.get,
  })

  const [days, setDays] = useState(null)
  useEffect(() => {
    if (data?.days) setDays(data.days)
  }, [data])

  const saveMutation = useMutation({
    mutationFn: () => workingHoursService.update(days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['working-hours'] })
      queryClient.invalidateQueries({ queryKey: ['business'] })
      toast.success('Working hours saved')
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message === 'The given data was invalid.'
          ? 'Check the hours — closing time must be after opening time.'
          : 'Could not save working hours'
      ),
  })

  const patchDay = (dayOfWeek, patch) =>
    setDays((all) =>
      all.map((d) => (d.day_of_week === dayOfWeek ? { ...d, ...patch } : d))
    )

  const copyMondayToWeekdays = () => {
    const monday = days.find((d) => d.day_of_week === 1)
    setDays((all) =>
      all.map((d) =>
        [2, 3, 4, 5].includes(d.day_of_week)
          ? { ...d, is_closed: monday.is_closed, open_time: monday.open_time, close_time: monday.close_time }
          : d
      )
    )
    toast.success('Monday’s hours copied to Tue–Fri')
  }

  if (isLoading || !days) return <CenteredSpinner />

  return (
    <div className="space-y-4">
      <Card
        title="Weekly hours"
        actions={
          <Button variant="ghost" onClick={copyMondayToWeekdays}>
            Copy Mon → weekdays
          </Button>
        }
      >
        <div className="divide-y divide-line">
          {days.map((day) => (
            <div key={day.day_of_week} className="flex flex-wrap items-center gap-3 py-2.5">
              <span className="w-24 text-sm font-medium text-ink">
                {DAY_NAMES[day.day_of_week]}
              </span>
              <label className="flex items-center gap-2 text-sm text-ink-muted">
                <Switch
                  checked={!day.is_closed}
                  label={`${DAY_NAMES[day.day_of_week]} open`}
                  onChange={(open) =>
                    patchDay(day.day_of_week, {
                      is_closed: !open,
                      open_time: open ? (day.open_time ?? '09:00') : day.open_time,
                      close_time: open ? (day.close_time ?? '18:00') : day.close_time,
                    })
                  }
                />
                {day.is_closed ? 'Closed' : 'Open'}
              </label>
              {!day.is_closed && (
                <span className="ml-auto flex items-center gap-2">
                  <input
                    type="time"
                    aria-label={`${DAY_NAMES[day.day_of_week]} opens`}
                    value={day.open_time ?? ''}
                    onChange={(e) => patchDay(day.day_of_week, { open_time: e.target.value })}
                    className="min-h-9 rounded-lg border border-line bg-surface px-2 text-sm text-ink focus:border-accent focus:outline-none"
                  />
                  <span className="text-ink-muted">–</span>
                  <input
                    type="time"
                    aria-label={`${DAY_NAMES[day.day_of_week]} closes`}
                    value={day.close_time ?? ''}
                    onChange={(e) => patchDay(day.day_of_week, { close_time: e.target.value })}
                    className="min-h-9 rounded-lg border border-line bg-surface px-2 text-sm text-ink focus:border-accent focus:outline-none"
                  />
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            Save hours
          </Button>
        </div>
      </Card>

      <ClosedDatesCard closedDates={data?.closed_dates ?? []} />
    </div>
  )
}

function ClosedDatesCard({ closedDates }) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['working-hours'] })

  const addMutation = useMutation({
    mutationFn: () => workingHoursService.addClosedDate({ date, reason: reason || null }),
    onSuccess: () => {
      invalidate()
      setDate('')
      setReason('')
      toast.success('Closed date added')
    },
    onError: (err) =>
      toast.error(err.response?.data?.errors?.date?.[0] ?? 'Could not add the date'),
  })

  const removeMutation = useMutation({
    mutationFn: (id) => workingHoursService.removeClosedDate(id),
    onSuccess: () => {
      invalidate()
      toast.success('Closed date removed')
    },
    onError: () => toast.error('Could not remove the date'),
  })

  return (
    <Card title="Closed dates (holidays)">
      {closedDates.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <CalendarOff size={15} /> No upcoming closed dates.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {closedDates.map((cd) => (
            <li key={cd.id} className="flex items-center gap-3 py-2">
              <span className="text-sm font-medium text-ink">{friendlyDate(cd.date)}</span>
              {cd.reason && <span className="text-sm text-ink-muted">{cd.reason}</span>}
              <IconButton
                label="Remove"
                className="ml-auto"
                onClick={() => removeMutation.mutate(cd.id)}
              >
                <Trash2 size={15} className="text-danger" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-40"
        />
        <Input
          label="Reason (optional)"
          placeholder="Eid holiday"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-48"
        />
        <Button
          variant="secondary"
          disabled={!date}
          loading={addMutation.isPending}
          onClick={() => addMutation.mutate()}
        >
          Add closed date
        </Button>
      </div>
    </Card>
  )
}

/* ── Widget ───────────────────────────────────────────────────────────── */

function WidgetTab() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['business'],
    queryFn: businessService.get,
  })
  const business = data?.business

  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmRegen, setConfirmRegen] = useState(false)

  const regenMutation = useMutation({
    mutationFn: businessService.regenerateWidgetKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] })
      setConfirmRegen(false)
      toast.success('Widget key regenerated — update your embed code')
    },
    onError: () => toast.error('Could not regenerate the key'),
  })

  if (isLoading || !business) return <CenteredSpinner />

  const snippet = `<script src="${window.location.origin}/widget.js" data-widget-key="${business.widget_key}" defer></script>`
  const maskedKey = `bp_live_••••••••${business.widget_key?.slice(-4)}`

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Card title="Embed the chat widget">
        <p className="mb-3 text-sm text-ink-muted">
          Paste this one line before the closing <code className="text-ink">&lt;/body&gt;</code> tag
          of your website. That's the whole install.
        </p>
        <div className="overflow-x-auto rounded-lg border border-line bg-surface-2 p-3">
          <code className="text-xs break-all text-ink">{snippet}</code>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button variant="secondary" onClick={copySnippet}>
            {copied ? <Check size={15} className="text-ok" /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy code'}
          </Button>
          <span className="text-sm text-ink-muted">
            {business.widget_seen_at
              ? `✓ Widget seen on your site ${friendlyDate(business.widget_seen_at)}`
              : 'Not detected on your site yet'}
          </span>
        </div>
      </Card>

      <Card title="Widget key">
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs text-ink">
            {showKey ? business.widget_key : maskedKey}
          </code>
          <IconButton label={showKey ? 'Hide key' : 'Show key'} onClick={() => setShowKey((s) => !s)}>
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </IconButton>
          <Button variant="secondary" className="ml-auto" onClick={() => setConfirmRegen(true)}>
            <RefreshCw size={15} /> Regenerate
          </Button>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          The key identifies your business to the widget. Keep it out of screenshots.
        </p>
      </Card>

      <ConfirmModal
        open={confirmRegen}
        onClose={() => setConfirmRegen(false)}
        onConfirm={() => regenMutation.mutate()}
        loading={regenMutation.isPending}
        danger
        title="Regenerate widget key?"
        message="Your current embed code stops working immediately. You'll need to update the snippet on your website with the new key."
        confirmLabel="Regenerate key"
      />
    </div>
  )
}

function CenteredSpinner() {
  return (
    <div className="flex justify-center py-16">
      <Spinner size={24} />
    </div>
  )
}
