import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarClock,
  Clock,
  User,
  Package,
  StickyNote,
  History,
  Wrench,
  RefreshCw,
} from 'lucide-react'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/Skeleton'
import StatusChip, { STATUS_TONES } from '@/components/StatusChip'
import SlotPicker from '@/components/SlotPicker'
import { Input } from '@/components/Field'
import { useToast } from '@/components/Toast'
import { bookingService } from '@/services/bookingService'
import { integrationService } from '@/services/integrationService'
import { friendlyDateTime } from '@/utils/dates'
import { SourceIcon } from '@/pages/Bookings'

// The API tells us the single legal next step; we only label it.
const NEXT_LABELS = {
  confirmed: 'Confirm booking',
  completed: 'Mark completed',
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
  }

  const statusMutation = useMutation({
    mutationFn: ({ status, reason }) => bookingService.updateStatus(id, status, reason),
    onSuccess: (updated) => {
      invalidate()
      setCancelling(false)
      setCancelReason('')
      toast.success(`Booking ${updated.status}`)
    },
    onError: (err) =>
      toast.error(err.response?.data?.errors?.status?.[0] ?? 'Could not update the booking'),
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
      toast.error(err.response?.data?.errors?.starts_at?.[0] ?? 'Could not reschedule'),
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    )
  }

  if (!booking) return null

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeader
        title={booking.reference}
        backTo="/bookings"
        actions={<StatusChip tone={STATUS_TONES[booking.status]}>{booking.status}</StatusChip>}
      />

      <Card>
        <dl className="space-y-3">
          <Row icon={User} label="Customer">
            {booking.customer ? (
              <Link to={`/customers/${booking.customer.id}`} className="text-accent hover:underline">
                {booking.customer.name}
              </Link>
            ) : (
              '—'
            )}
            {booking.customer?.phone && (
              <span className="ml-2 text-ink-muted">{booking.customer.phone}</span>
            )}
          </Row>
          <Row icon={Package} label="Service">
            {booking.service?.name}
            <span className="ml-2 text-ink-muted">{booking.service?.duration_minutes} min</span>
          </Row>
          <Row icon={CalendarClock} label="When">
            {friendlyDateTime(booking.starts_at)}
          </Row>
          <Row icon={Clock} label="Source">
            <SourceIcon source={booking.source} />
          </Row>
          {booking.notes && (
            <Row icon={StickyNote} label="Notes">
              {booking.notes}
            </Row>
          )}
          {booking.rescheduled_from && (
            <Row icon={History} label="Rescheduled from">
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
        </dl>
      </Card>

      {booking.status === 'cancelled' && booking.cancel_reason && (
        <Card>
          <p className="text-sm text-ink-muted">
            <span className="font-medium text-danger">Cancelled:</span> {booking.cancel_reason}
          </p>
        </Card>
      )}

      {/* Action zone — only ever the one legal next step */}
      {(booking.next_status || booking.is_cancellable) && (
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            {booking.next_status && (
              <Button
                loading={statusMutation.isPending}
                onClick={() => statusMutation.mutate({ status: booking.next_status })}
              >
                {NEXT_LABELS[booking.next_status]}
              </Button>
            )}
            {booking.is_cancellable && (
              <>
                <Button variant="secondary" onClick={() => setRescheduling(true)}>
                  Reschedule
                </Button>
                <Button variant="ghost" onClick={() => setCancelling(true)}>
                  Cancel booking
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

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
                statusMutation.mutate({ status: 'cancelled', reason: cancelReason || null })
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
      toast.error(err.response?.data?.message ?? 'Could not send to GarageFlow'),
  })

  if (booking.sync_status === 'synced') {
    return (
      <span className="flex flex-wrap items-center gap-2">
        <StatusChip tone="ok">in GarageFlow</StatusChip>
        {booking.garageflow_job_id && (
          <span className="text-xs text-ink-muted">job #{booking.garageflow_job_id}</span>
        )}
      </span>
    )
  }

  if (booking.sync_status === 'failed') {
    return (
      <span className="flex flex-wrap items-center gap-2">
        <StatusChip tone="danger">sync failed</StatusChip>
        <Button variant="ghost" loading={retry.isPending} onClick={() => retry.mutate()}>
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
