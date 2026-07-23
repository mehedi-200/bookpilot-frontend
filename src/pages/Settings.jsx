import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  CalendarOff,
  Building2,
  Clock,
  Code2,
  ShieldCheck,
  Zap,
  Plus,
} from 'lucide-react'
import Card from '@/components/Card'
import Button, { IconButton } from '@/components/Button'
import { Input, Select } from '@/components/Field'
import Switch from '@/components/Switch'
import ConfirmModal from '@/components/ConfirmModal'
import Spinner from '@/components/Spinner'
import { useToast } from '@/components/Toast'
import { applyServerErrors } from '@/hooks/useAuth'
import {
  businessService,
  workingHoursService,
} from '@/services/businessService'
import { friendlyDate } from '@/utils/dates'

const TABS = [
  { label: 'Business', icon: Building2, hint: 'Name, contact, timezone' },
  { label: 'Working hours', icon: Clock, hint: 'When you are open' },
  { label: 'Widget', icon: Code2, hint: 'Embed on your site' },
]
const TAB_NAMES = TABS.map((t) => t.label)
const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export default function Settings() {
  // The dashboard onboarding checklist links straight to a tab.
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(() => {
    const requested = searchParams.get('tab')
    return TAB_NAMES.includes(requested) ? requested : 'Business'
  })

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-semibold text-ink">Settings</h1>
        <p className="text-sm text-ink-muted">
          What your AI knows about the business, and how customers reach it.
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1.5">
        {TABS.map(({ label, icon: Icon, hint }) => (
          <button
            key={label}
            type="button"
            onClick={() => setTab(label)}
            className={`flex min-h-11 flex-1 items-center justify-center gap-2.5 rounded-lg px-4 whitespace-nowrap transition-colors ${
              tab === label
                ? 'bg-accent text-accent-contrast'
                : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
            }`}
          >
            <Icon size={17} className="shrink-0" />
            <span className="text-left">
              <span className="block text-sm font-medium">{label}</span>
              <span
                className={`hidden text-[11px] sm:block ${
                  tab === label ? 'text-accent-contrast/75' : 'text-ink-muted'
                }`}
              >
                {hint}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {tab === 'Business' && <BusinessTab />}
        {tab === 'Working hours' && <HoursTab />}
        {tab === 'Widget' && <WidgetTab />}
      </div>
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
    formState: { errors, isDirty },
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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Business settings saved')
    },
    onError: (err) => {
      if (!applyServerErrors(err, setError))
        toast.error('Could not save settings')
    },
  })

  const autoConfirm = watch('auto_confirm')

  if (isLoading) return <CenteredSpinner />

  return (
    <form
      onSubmit={handleSubmit((d) => mutation.mutate(d))}
      className="space-y-4"
    >
      <Card
        title="Business profile"
        description="Shown to customers in the chat widget."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="sm:col-span-2 xl:col-span-1">
            <Input
              label="Business name"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
          </div>
          <Input
            label="Phone"
            placeholder="01712-345678"
            {...register('phone')}
          />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <div className="sm:col-span-2 xl:col-span-3">
            <Input label="Address" {...register('address')} />
          </div>
          <div className="sm:col-span-2 xl:col-span-3">
            <Select
              label="Timezone"
              hint="All booking times are shown and stored against this."
              error={errors.timezone?.message}
              {...register('timezone')}
            >
              {Intl.supportedValuesOf('timeZone').map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <Card
        title="AI booking behaviour"
        description="What happens when your assistant books someone in."
      >
        {/* Two explicit choices beat one unlabelled switch */}
        <div className="grid gap-3 md:grid-cols-2">
          <ChoiceCard
            icon={ShieldCheck}
            title="Review first"
            body="AI bookings arrive as Pending. You confirm each one before it’s final."
            selected={!autoConfirm}
            onSelect={() =>
              setValue('auto_confirm', false, { shouldDirty: true })
            }
          />
          <ChoiceCard
            icon={Zap}
            title="Confirm instantly"
            body="The AI confirms straight away. Customers get a definite answer in chat."
            selected={autoConfirm}
            onSelect={() =>
              setValue('auto_confirm', true, { shouldDirty: true })
            }
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>
          Save changes
        </Button>
      </div>
    </form>
  )
}

function ChoiceCard({ icon: Icon, title, body, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-lg border p-3 text-left transition-colors ${
        selected
          ? 'border-accent bg-accent/5'
          : 'border-line hover:border-ink-muted'
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon
          size={16}
          className={selected ? 'text-accent' : 'text-ink-muted'}
        />
        <span className="text-sm font-medium text-ink">{title}</span>
        <span
          className={`ml-auto flex size-4 items-center justify-center rounded-full border ${
            selected
              ? 'border-accent bg-accent text-accent-contrast'
              : 'border-line'
          }`}
        >
          {selected && <Check size={10} strokeWidth={3} />}
        </span>
      </span>
      <span className="mt-1.5 block text-xs text-ink-muted">{body}</span>
    </button>
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
          ? {
              ...d,
              is_closed: monday.is_closed,
              open_time: monday.open_time,
              close_time: monday.close_time,
            }
          : d
      )
    )
    toast.success('Monday’s hours copied to Tue–Fri')
  }

  if (isLoading || !days) return <CenteredSpinner />

  const openDays = days.filter((d) => !d.is_closed).length

  return (
    <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        <Card
          title="Weekly hours"
          description={`Open ${openDays} ${openDays === 1 ? 'day' : 'days'} a week — the AI only offers times inside these.`}
          actions={
            <Button variant="secondary" onClick={copyMondayToWeekdays}>
              Copy Mon → Fri
            </Button>
          }
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-line">
            {days.map((day) => (
              <li
                key={day.day_of_week}
                className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 ${
                  day.is_closed ? 'bg-surface-2/40' : ''
                }`}
              >
                <span
                  className={`w-24 shrink-0 text-sm font-medium ${
                    day.is_closed ? 'text-ink-muted' : 'text-ink'
                  }`}
                >
                  {DAY_NAMES[day.day_of_week]}
                </span>

                <span className="flex w-24 shrink-0 items-center gap-2">
                  <Switch
                    checked={!day.is_closed}
                    label={`${DAY_NAMES[day.day_of_week]} open`}
                    onChange={(open) =>
                      patchDay(day.day_of_week, {
                        is_closed: !open,
                        open_time: open
                          ? (day.open_time ?? '09:00')
                          : day.open_time,
                        close_time: open
                          ? (day.close_time ?? '18:00')
                          : day.close_time,
                      })
                    }
                  />
                  <span className="text-xs text-ink-muted">
                    {day.is_closed ? 'Closed' : 'Open'}
                  </span>
                </span>

                {day.is_closed ? (
                  <span className="text-sm text-ink-muted">—</span>
                ) : (
                  <span className="ml-auto flex items-center gap-2">
                    <TimeField
                      label={`${DAY_NAMES[day.day_of_week]} opens`}
                      value={day.open_time ?? ''}
                      onChange={(value) =>
                        patchDay(day.day_of_week, { open_time: value })
                      }
                    />
                    <span className="text-ink-muted">–</span>
                    <TimeField
                      label={`${DAY_NAMES[day.day_of_week]} closes`}
                      value={day.close_time ?? ''}
                      onChange={(value) =>
                        patchDay(day.day_of_week, { close_time: value })
                      }
                    />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex justify-end">
          <Button
            loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            Save hours
          </Button>
        </div>
      </div>

      <ClosedDatesCard closedDates={data?.closed_dates ?? []} />
    </div>
  )
}

function TimeField({ label, value, onChange }) {
  return (
    <input
      type="time"
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-9 rounded-lg border border-line bg-surface px-2 text-sm text-ink tabular-nums focus:border-accent focus:outline-none"
    />
  )
}

function ClosedDatesCard({ closedDates }) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['working-hours'] })

  const addMutation = useMutation({
    mutationFn: () =>
      workingHoursService.addClosedDate({ date, reason: reason || null }),
    onSuccess: () => {
      invalidate()
      setDate('')
      setReason('')
      toast.success('Closed date added')
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.errors?.date?.[0] ?? 'Could not add the date'
      ),
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
    <Card
      title="Holidays & closures"
      description="One-off days the business is shut, on top of the weekly pattern."
      bodyClassName="flex flex-col"
    >
      {closedDates.length === 0 ? (
        <p className="flex items-center gap-2 rounded-lg bg-surface-2 p-3 text-sm text-ink-muted">
          <CalendarOff size={15} /> No upcoming closures.
        </p>
      ) : (
        <ul className="mb-3 divide-y divide-line rounded-lg border border-line">
          {closedDates.map((cd) => (
            <li key={cd.id} className="flex items-center gap-3 px-3 py-2">
              <CalendarOff size={14} className="shrink-0 text-ink-muted" />
              <span className="text-sm font-medium text-ink">
                {friendlyDate(cd.date)}
              </span>
              {cd.reason && (
                <span className="text-sm text-ink-muted">{cd.reason}</span>
              )}
              <IconButton
                label={`Remove ${cd.date}`}
                className="ml-auto"
                onClick={() => removeMutation.mutate(cd.id)}
              >
                <Trash2 size={15} className="text-danger" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-end gap-2 border-t border-line pt-4">
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
          <Plus size={15} /> Add
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
  const live = !!business.widget_seen_at

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap items-center gap-3 rounded-xl border p-3.5"
        style={{
          borderColor: `color-mix(in srgb, var(--${live ? 'ok' : 'warn'}) 35%, transparent)`,
          background: `color-mix(in srgb, var(--${live ? 'ok' : 'warn'}) 8%, var(--surface))`,
        }}
      >
        <span
          className={`flex size-8 items-center justify-center rounded-lg ${live ? 'text-ok' : 'text-warn'}`}
        >
          {live ? <Check size={18} /> : <Code2 size={18} />}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">
            {live ? 'Widget is live on your site' : 'Widget not detected yet'}
          </p>
          <p className="text-xs text-ink-muted">
            {live
              ? `First seen ${friendlyDate(business.widget_seen_at)}`
              : 'Paste the snippet below and reload your website.'}
          </p>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card
          title="Install"
          description="Paste this one line before the closing </body> tag of your website."
        >
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-line bg-surface-2 p-3 pr-24 text-xs text-ink">
              <code>{snippet}</code>
            </pre>
            <Button
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={copySnippet}
            >
              {copied ? (
                <Check size={14} className="text-ok" />
              ) : (
                <Copy size={14} />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p className="mt-2.5 text-xs text-ink-muted">
            That’s the whole install — no CSS to add, and it can’t affect the
            rest of your page.
          </p>
        </Card>

        <Card
          title="Widget key"
          description="Identifies your business to the widget. Keep it out of screenshots."
        >
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs text-ink">
              {showKey ? business.widget_key : maskedKey}
            </code>
            <IconButton
              label={showKey ? 'Hide key' : 'Show key'}
              onClick={() => setShowKey((s) => !s)}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </IconButton>
            <Button variant="secondary" onClick={() => setConfirmRegen(true)}>
              <RefreshCw size={14} /> Regenerate
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmModal
        open={confirmRegen}
        onClose={() => setConfirmRegen(false)}
        onConfirm={() => regenMutation.mutate()}
        loading={regenMutation.isPending}
        danger
        title="Regenerate widget key?"
        message="Your current embed code stops working immediately. You'll need to paste the new snippet on your website."
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
