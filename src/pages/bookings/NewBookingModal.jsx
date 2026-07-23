import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import { Input, Select, Textarea } from '@/components/Field'
import SlotPicker from '@/components/SlotPicker'
import { useToast } from '@/components/Toast'
import { catalogService } from '@/services/catalogService'
import { customerService } from '@/services/customerService'
import { bookingService } from '@/services/bookingService'

export default function NewBookingModal({ open, onClose, onCreated }) {
  const toast = useToast()
  const queryClient = useQueryClient()

  const [serviceId, setServiceId] = useState('')
  const [startsAt, setStartsAt] = useState(null)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [matched, setMatched] = useState(null)
  const [errors, setErrors] = useState({})

  const { data: services } = useQuery({
    queryKey: ['services', { active: 1, per_page: 100 }],
    queryFn: () => catalogService.list({ active: 1, per_page: 100 }),
    enabled: open,
  })

  // Reset everything when the modal reopens.
  useEffect(() => {
    if (open) {
      setServiceId('')
      setStartsAt(null)
      setPhone('')
      setName('')
      setNotes('')
      setMatched(null)
      setErrors({})
    }
  }, [open])

  // Phone is identity: as soon as it matches, fill the name and say so.
  useEffect(() => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 6) {
      setMatched(null)
      return
    }
    const timer = setTimeout(async () => {
      try {
        const found = await customerService.lookup(phone)
        setMatched(found)
        if (found) setName(found.name)
      } catch {
        setMatched(null)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [phone])

  const mutation = useMutation({
    mutationFn: () =>
      bookingService.create({
        service_id: Number(serviceId),
        starts_at: startsAt,
        customer_id: matched?.id ?? undefined,
        customer_name: matched ? undefined : name,
        customer_phone: matched ? undefined : phone,
        notes: notes || undefined,
      }),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      toast.success(`Booking ${booking.reference} created`)
      onCreated(booking)
    },
    onError: (err) => {
      const serverErrors = err.response?.data?.errors ?? {}
      setErrors(serverErrors)
      const first = Object.values(serverErrors)[0]
      toast.error(Array.isArray(first) ? first[0] : 'Could not create the booking')
    },
  })

  const canSubmit = serviceId && startsAt && phone && name

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New booking"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Create booking
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Service"
          value={serviceId}
          error={errors.service_id?.[0]}
          onChange={(e) => {
            setServiceId(e.target.value)
            setStartsAt(null)
          }}
        >
          <option value="">Choose a service…</option>
          {(services?.data ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.duration_minutes} min
            </option>
          ))}
        </Select>

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">When</p>
          <SlotPicker serviceId={serviceId} value={startsAt} onChange={setStartsAt} />
          {errors.starts_at && (
            <p className="mt-1 text-xs text-danger">{errors.starts_at[0]}</p>
          )}
        </div>

        <div className="space-y-4 border-t border-line pt-4">
          <Input
            label="Customer phone"
            type="tel"
            placeholder="01712-345678"
            value={phone}
            error={errors.customer_phone?.[0]}
            onChange={(e) => setPhone(e.target.value)}
          />
          {matched && (
            <p className="flex items-center gap-1.5 text-xs text-ok">
              <Check size={14} /> Existing customer — booking will be added to their record.
            </p>
          )}
          <Input
            label="Customer name"
            placeholder="Rahim Uddin"
            value={name}
            error={errors.customer_name?.[0]}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            label="Notes (optional)"
            placeholder="Anything the team should know…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  )
}
