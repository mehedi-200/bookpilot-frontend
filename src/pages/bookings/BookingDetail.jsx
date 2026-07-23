import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarClock,
  User,
  Package,
  StickyNote,
  History,
  Wrench,
  RefreshCw,
  Phone,
  Mail,
  Check,
  Ban,
  CalendarSync,
} from 'lucide-react'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/Skeleton'
import StatusChip, { STATUS_TONES } from '@/components/StatusChip'
import SlotPicker from '@/components/SlotPicker'
import Avatar from '@/components/Avatar'
import { Input } from '@/components/Field'
import { useToast } from '@/components/Toast'
import { bookingService } from '@/services/bookingService'
import { integrationService } from '@/services/integrationService'
import { friendlyDate, friendlyDateTime, timeLabel } from '@/utils/dates'
import { SourceIcon } from '@/pages/Bookings'

// The API tells us the single legal next step; we only label it.
const NEXT_ACTIONS = {
  confirmed: { label: 'Confirm booking', icon: Check },
  completed: { label: 'Mark completed', icon: Check },
}

export default function BookingDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const toast = useToast()

  const [cancelling, setCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [rescheduling, setRescheduling] = useState(false)
  const [newStart, setNewStart] = useState(null)

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.get(id),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['booking', id] })
    queryClient.invalidateQueries({ queryKey: ['bookings'] })
    queryClient.invalidateQueries({ queryKey: ['availability'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const statusMutation = useMutation({
    mutationFn: ({ status, reason }) =>
      bookingService.updateStatus(id, status, reason),
    onSuccess: (updated) => {
      invalidate()
      setCancelling(false)
      setCancelReason('')
      toast.success(`Booking ${updated.status}`)
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.errors?.status?.[0] ??
          'Could not update the booking'
      ),
  })

  const rescheduleMutation = useMutation({
    mutationFn: () => bookingService.reschedule(id, newStart),
    onSuccess: () => {
      invalidate()
      setRescheduling(false)
      setNewStart(null)
      toast.success('Booking rescheduled')
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.errors?.starts_at?.[0] ?? 'Could not reschedule'
      ),
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid gap-3 lg:grid-cols-2">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!booking) return null

  const next = booking.next_status ? NEXT_ACTIONS[booking.next_status] : null
  const NextIcon = next?.icon

  return (
    <div className="space-y-3">
      <PageHeader
        title={booking.reference}
        backTo="/bookings"
        actions={
          <StatusChip tone={STATUS_TONES[booking.status]}>
            {booking.status}
          </StatusChip>
        }
      />

      {/* The appointment time is what everyone opens this page for */}
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span
            className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl"
            style={{
              color: 'var(--accent)',
              background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
            }}
          >
            <CalendarClock size={22} />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-ink">
              {friendlyDate(booking.starts_at)} at{' '}
              {timeLabel(booking.starts_at)}
            </p>
            <p className="text-sm text-ink-muted">
              {booking.service?.name} · {booking.service?.duration_minutes}{' '}
              minutes
              {booking.service?.price
                ? ` · ${Number(booking.service.price).toFixed(2)}`
                : ''}
            </p>
          </div>
          <div className="ml-auto">
            <SourceIcon source={booking.source} />
          </div>
        </div>

        {/* Action zone — only ever the one legal next step */}
        {(next || booking.is_cancellable) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            {next && (
              <Button
                loading={statusMutation.isPending}
                onClick={() =>
                  statusMutation.mutate({ status: booking.next_status })
                }
              >
                <NextIcon size={16} /> {next.label}
              </Button>
            )}
            {booking.is_cancellable && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setRescheduling(true)}
                >
                  <CalendarSync size={15} /> Reschedule
                </Button>
                <Button variant="ghost" onClick={() => setCancelling(true)}>
                  <Ban size={15} /> Cancel
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {booking.status === 'cancelled' && (
        <div
          className="rounded-xl border p-3.5 text-sm"
          style={{
            borderColor: 'color-mix(in srgb, var(--danger) 30%, transparent)',
            background: 'color-mix(in srgb, var(--danger) 7%, var(--surface))',
          }}
        >
          <span className="font-medium text-danger">Cancelled</span>
          {booking.cancel_reason && (
            <span className="text-ink-muted"> — {booking.cancel_reason}</span>
          )}
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
        <Card title="Details">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Row icon={Package} label="Service">
              {booking.service?.name}
            </Row>
            <Row icon={User} label="Booked by">
              {booking.source === 'widget'
                ? 'The AI assistant'
                : 'A team member'}
              {booking.conversation_id && (
                <Link
                  to={`/conversations/${booking.conversation_id}`}
                  className="ml-2 text-accent hover:underline"
                >
                  View the chat
                </Link>
              )}
            </Row>
            {booking.rescheduled_from && (
              <Row icon={History} label="Moved from">
                <span className="text-ink-muted line-through">
                  {friendlyDateTime(booking.rescheduled_from)}
                </span>
              </Row>
            )}
            {booking.sync_status && (
              <Row icon={Wrench} label="GarageFlow">
                <SyncStatus booking={booking} onSynced={invalidate} />
              </Row>
            )}
            {booking.notes && (
              <div className="sm:col-span-2">
                <Row icon={StickyNote} label="Notes">
                  {booking.notes}
                </Row>
              </div>
            )}
          </dl>
        </Card>
        <Card title="Customer">
          {booking.customer ? (
            <>
              <Link
                to={`/customers/${booking.customer.id}`}
                className="flex items-center gap-3 rounded-lg transition-colors hover:opacity-80"
              >
                <Avatar name={booking.customer.name} size="size-11" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">
                    {booking.customer.name}
                  </p>
                  <p className="text-xs text-ink-muted">View full profile</p>
                </div>
              </Link>
              <div className="mt-3 space-y-1.5 border-t border-line pt-3">
                <a
                  href={`tel:${booking.customer.phone}`}
                  className="flex items-center gap-2 text-sm text-ink tabular-nums hover:text-accent"
                >
                  <Phone size={14} className="text-ink-muted" />
                  {booking.customer.phone}
                </a>
                {booking.customer.email && (
                  <a
                    href={`mailto:${booking.customer.email}`}
                    className="flex items-center gap-2 truncate text-sm text-ink hover:text-accent"
                  >
                    <Mail size={14} className="text-ink-muted" />
                    {booking.customer.email}
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-muted">
              No customer on this booking.
            </p>
          )}
        </Card>
      </div>

      <Modal
        open={cancelling}
        onClose={() => setCancelling(false)}
        title="Cancel this booking?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelling(false)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              loading={statusMutation.isPending}
              onClick={() =>
                statusMutation.mutate({
                  status: 'cancelled',
                  reason: cancelReason || null,
                })
              }
            >
              Cancel booking
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">
            The slot becomes available again immediately. This cannot be undone.
          </p>
          <Input
            label="Reason (optional)"
            placeholder="Customer called to cancel"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={rescheduling}
        onClose={() => setRescheduling(false)}
        title="Reschedule booking"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRescheduling(false)}>
              Cancel
            </Button>
            <Button
              disabled={!newStart}
              loading={rescheduleMutation.isPending}
              onClick={() => rescheduleMutation.mutate()}
            >
              Move booking
            </Button>
          </>
        }
      >
        <SlotPicker
          serviceId={booking.service?.id}
          value={newStart}
          onChange={setNewStart}
        />
      </Modal>
    </div>
  )
}

// Sync is best-effort and never blocks a booking — so when it fails the fix is
// one click away rather than a mystery.
function SyncStatus({ booking, onSynced }) {
  const toast = useToast()

  const retry = useMutation({
    mutationFn: () => integrationService.syncBooking(booking.id),
    onSuccess: () => {
      onSynced()
      toast.success('Sent to GarageFlow')
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ?? 'Could not send to GarageFlow'
      ),
  })

  if (booking.sync_status === 'synced') {
    return (
      <span className="flex flex-wrap items-center gap-2">
        <StatusChip tone="ok">in GarageFlow</StatusChip>
        {booking.garageflow_job_id && (
          <span className="text-xs text-ink-muted">
            job #{booking.garageflow_job_id}
          </span>
        )}
      </span>
    )
  }

  if (booking.sync_status === 'failed') {
    return (
      <span className="flex flex-wrap items-center gap-2">
        <StatusChip tone="danger">sync failed</StatusChip>
        <Button
          variant="ghost"
          loading={retry.isPending}
          onClick={() => retry.mutate()}
        >
          <RefreshCw size={14} /> Retry
        </Button>
      </span>
    )
  }

  return <StatusChip tone="warn">syncing…</StatusChip>
}

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3 text-sm">
      <dt className="flex w-32 shrink-0 items-center gap-2 text-ink-muted">
        <Icon size={15} />
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-ink">{children}</dd>
    </div>
  )
}
