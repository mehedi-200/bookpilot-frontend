import { useState } from 'react'
import { Plus, CalendarX } from 'lucide-react'
import Button, { IconButton } from '@/components/Button'
import { Input, Select, Textarea } from '@/components/Field'
import Card from '@/components/Card'
import StatusChip, { STATUS_TONES } from '@/components/StatusChip'
import Switch from '@/components/Switch'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import DataList from '@/components/DataList'
import SearchInput from '@/components/SearchInput'
import PageHeader from '@/components/PageHeader'
import Spinner from '@/components/Spinner'
import Skeleton, { StatCardSkeleton } from '@/components/Skeleton'
import { useToast } from '@/components/Toast'

// Internal showcase page (/ui-kit) — used to verify every shared component
// in all three themes and both layouts. Not linked from navigation.
const FAKE_ROWS = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  ref: `BP-2026-00${40 + i}`,
  customer: ['Rahim Uddin', 'Karim Ahmed', 'Fatema Begum', 'Jasim Mia'][i % 4],
  service: ['Full Service', 'Oil Change', 'Brake Check', 'AC Repair'][i % 4],
  status: ['pending', 'confirmed', 'completed', 'cancelled'][i % 4],
}))

export default function UiKit() {
  const toast = useToast()
  const [modal, setModal] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [page, setPage] = useState(3)
  const [perPage, setPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [switchOn, setSwitchOn] = useState(true)

  return (
    <div className="space-y-4">
      <PageHeader
        title="UI Kit"
        subtitle="every shared component, all themes"
        backTo="/"
      />

      <Card title="Buttons">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading>Saving…</Button>
          <IconButton label="Add">
            <Plus size={18} />
          </IconButton>
          <Spinner />
        </div>
      </Card>

      <Card title="Form fields">
        <div className="grid gap-4 lg:grid-cols-3">
          <Input
            label="Name"
            placeholder="Rahim Uddin"
            hint="Customer full name"
          />
          <Select label="Service" error="Pick a service">
            <option value="">Choose…</option>
            <option>Full Service</option>
          </Select>
          <Textarea label="Notes" placeholder="Anything useful…" />
        </div>
      </Card>

      <Card title="Switches">
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <Switch
              checked={switchOn}
              label="Demo switch"
              onChange={setSwitchOn}
            />
            {switchOn ? 'On' : 'Off'}
          </label>
          <span className="flex items-center gap-2 text-sm text-ink-muted">
            <Switch checked disabled label="Disabled on" /> disabled on
          </span>
          <span className="flex items-center gap-2 text-sm text-ink-muted">
            <Switch checked={false} disabled label="Disabled off" /> disabled
            off
          </span>
        </div>
      </Card>

      <Card title="Status chips">
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_TONES).map(([status, tone]) => (
            <StatusChip key={status} tone={tone}>
              {status.replace('_', ' ')}
            </StatusChip>
          ))}
        </div>
      </Card>

      <Card title="Skeletons">
        <div className="grid gap-3 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <div className="space-y-2 lg:col-span-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </Card>

      <Card title="Overlays & toasts">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setModal(true)}>
            Open Modal / Sheet
          </Button>
          <Button variant="secondary" onClick={() => setConfirm(true)}>
            Open ConfirmModal
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.success('Booking saved')}
          >
            Success toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.error('API unreachable — try again')}
          >
            Error toast
          </Button>
        </div>
      </Card>

      <DataList
        columns={[
          { key: 'ref', header: 'Ref', className: 'font-medium' },
          { key: 'customer', header: 'Customer' },
          { key: 'service', header: 'Service' },
          {
            key: 'status',
            header: 'Status',
            render: (r) => (
              <StatusChip tone={STATUS_TONES[r.status]}>{r.status}</StatusChip>
            ),
          },
        ]}
        rows={FAKE_ROWS}
        loading={loading}
        onRowClick={(r) => toast.success(`Row ${r.ref} clicked`)}
        renderCard={(r) => (
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-ink">{r.customer}</p>
              <p className="text-xs text-ink-muted">
                {r.ref} · {r.service}
              </p>
            </div>
            <StatusChip tone={STATUS_TONES[r.status]}>{r.status}</StatusChip>
          </div>
        )}
        toolbar={
          <>
            <Button>
              <Plus size={16} /> New booking
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setLoading(true)
                setTimeout(() => setLoading(false), 1500)
              }}
            >
              Simulate loading
            </Button>
            <SearchInput
              className="w-full md:ml-auto md:w-64"
              onChange={() => {}}
            />
          </>
        }
        empty={{
          icon: CalendarX,
          title: 'No bookings yet',
          hint: 'They appear here as soon as the AI books one.',
        }}
        pagination={{
          meta: {
            current_page: page,
            last_page: 12,
            total: 113,
            per_page: perPage,
          },
          onPage: setPage,
          onPerPage: setPerPage,
          onRefresh: () => toast.success('Refreshed'),
        }}
      />

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Example modal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModal(false)}>Save</Button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">
          Centered dialog on desktop — bottom sheet with a drag handle on
          mobile.
        </p>
      </Modal>

      <ConfirmModal
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => setConfirm(false)}
        title="Cancel booking?"
        message="The customer will not be notified in this demo. This action can't be undone."
        confirmLabel="Cancel booking"
        danger
      />
    </div>
  )
}
