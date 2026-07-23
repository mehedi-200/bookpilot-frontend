import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import DataList from '@/components/DataList'
import Button, { IconButton } from '@/components/Button'
import { Input, Select } from '@/components/Field'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import SearchInput from '@/components/SearchInput'
import Switch from '@/components/Switch'
import StatusChip from '@/components/StatusChip'
import { useToast } from '@/components/Toast'
import { useAuth, applyServerErrors } from '@/hooks/useAuth'
import { catalogService } from '@/services/catalogService'

const DURATIONS = [15, 30, 45, 60, 90, 120]

export default function Services() {
  const { isAdmin } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [q, setQ] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | service
  const [deleting, setDeleting] = useState(null)

  const params = {
    page,
    per_page: perPage,
    q: q || undefined,
    active: activeFilter === '' ? undefined : activeFilter,
  }
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['services', params],
    queryFn: () => catalogService.list(params),
    placeholderData: (prev) => prev,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['services'] })

  const toggleMutation = useMutation({
    mutationFn: (service) => catalogService.toggleActive(service.id),
    onSuccess: (updated) => {
      invalidate()
      toast.success(updated.active ? 'Service activated' : 'Service deactivated')
    },
    onError: () => toast.error('Could not update the service'),
  })

  const deleteMutation = useMutation({
    mutationFn: (service) => catalogService.remove(service.id),
    onSuccess: () => {
      invalidate()
      setDeleting(null)
      toast.success('Service deleted')
    },
    onError: () => toast.error('Could not delete the service'),
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  return (
    <>
      <DataList
        columns={[
          { key: 'name', header: 'Service', className: 'font-medium' },
          {
            key: 'duration_minutes',
            header: 'Duration',
            className: 'text-ink-muted',
            render: (s) => `${s.duration_minutes} min`,
          },
          {
            key: 'price',
            header: 'Price',
            render: (s) => Number(s.price).toFixed(2),
          },
          {
            key: 'active',
            header: 'Active',
            render: (s) =>
              isAdmin ? (
                <span onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={s.active}
                    label={`Toggle ${s.name}`}
                    onChange={() => toggleMutation.mutate(s)}
                  />
                </span>
              ) : (
                <StatusChip tone={s.active ? 'ok' : 'neutral'}>
                  {s.active ? 'active' : 'inactive'}
                </StatusChip>
              ),
          },
          ...(isAdmin
            ? [
                {
                  key: 'actions',
                  header: '',
                  className: 'w-20',
                  render: (s) => (
                    <span
                      className="flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton label="Edit" onClick={() => setEditing(s)}>
                        <Pencil size={15} />
                      </IconButton>
                      <IconButton label="Delete" onClick={() => setDeleting(s)}>
                        <Trash2 size={15} className="text-danger" />
                      </IconButton>
                    </span>
                  ),
                },
              ]
            : []),
        ]}
        rows={rows}
        loading={isLoading}
        renderCard={(s) => (
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{s.name}</p>
              <p className="text-xs text-ink-muted">
                {s.duration_minutes} min · {Number(s.price).toFixed(2)}
              </p>
            </div>
            {isAdmin ? (
              <>
                <Switch
                  checked={s.active}
                  label={`Toggle ${s.name}`}
                  onChange={() => toggleMutation.mutate(s)}
                />
                <IconButton label="Edit" onClick={() => setEditing(s)}>
                  <Pencil size={15} />
                </IconButton>
                <IconButton label="Delete" onClick={() => setDeleting(s)}>
                  <Trash2 size={15} className="text-danger" />
                </IconButton>
              </>
            ) : (
              <StatusChip tone={s.active ? 'ok' : 'neutral'}>
                {s.active ? 'active' : 'inactive'}
              </StatusChip>
            )}
          </div>
        )}
        toolbar={
          <>
            {isAdmin && (
              <Button onClick={() => setEditing('new')}>
                <Plus size={16} /> Add service
              </Button>
            )}
            <div className="flex w-full items-center gap-2 md:ml-auto md:w-auto">
              <Select
                aria-label="Filter by status"
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value)
                  setPage(1)
                }}
                className="w-32"
              >
                <option value="">All</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </Select>
              <SearchInput
                className="w-full md:w-56"
                placeholder="Search services…"
                value={q}
                onChange={(next) => {
                  setQ(next)
                  setPage(1)
                }}
              />
            </div>
          </>
        }
        empty={{
          icon: Package,
          title: q ? `No services matching “${q}”` : 'No services yet',
          hint: q
            ? undefined
            : 'Add the services customers can book — the AI can only offer what exists here.',
          action: isAdmin && !q && (
            <Button onClick={() => setEditing('new')}>
              <Plus size={16} /> Add service
            </Button>
          ),
        }}
        pagination={{
          meta,
          onPage: setPage,
          onPerPage: (n) => {
            setPerPage(n)
            setPage(1)
          },
          onRefresh: refetch,
          refreshing: isFetching,
        }}
      />

      <ServiceFormModal
        key={editing === 'new' ? 'new' : (editing?.id ?? 'closed')}
        editing={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          invalidate()
          setEditing(null)
        }}
      />

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteMutation.mutate(deleting)}
        loading={deleteMutation.isPending}
        danger
        title={`Delete ${deleting?.name}?`}
        message="Past bookings keep the service name. Customers can no longer book it."
        confirmLabel="Delete service"
      />
    </>
  )
}

function ServiceFormModal({ editing, onClose, onSaved }) {
  const toast = useToast()
  const isNew = editing === 'new'
  const open = !!editing

  const knownDuration = isNew || DURATIONS.includes(editing?.duration_minutes)
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: isNew
      ? { name: '', durationChoice: '30', duration_custom: '', price: '' }
      : {
          name: editing?.name,
          durationChoice: knownDuration ? String(editing?.duration_minutes) : 'custom',
          duration_custom: knownDuration ? '' : String(editing?.duration_minutes),
          price: editing?.price,
        },
  })

  const durationChoice = watch('durationChoice')

  const mutation = useMutation({
    mutationFn: (form) => {
      const data = {
        name: form.name,
        duration_minutes:
          form.durationChoice === 'custom'
            ? Number(form.duration_custom)
            : Number(form.durationChoice),
        price: Number(form.price),
      }
      return isNew ? catalogService.create(data) : catalogService.update(editing.id, data)
    },
    onSuccess: () => {
      toast.success(isNew ? 'Service added' : 'Service updated')
      onSaved()
    },
    onError: (err) => {
      if (!applyServerErrors(err, setError)) toast.error('Could not save')
    },
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isNew ? 'Add service' : `Edit ${editing?.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} onClick={handleSubmit((d) => mutation.mutate(d))}>
            {isNew ? 'Add service' : 'Save changes'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <Input
          label="Name"
          placeholder="Full Service"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Duration" {...register('durationChoice')}>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d} minutes
              </option>
            ))}
            <option value="custom">Custom…</option>
          </Select>
          {durationChoice === 'custom' ? (
            <Input
              label="Minutes"
              type="number"
              min="5"
              max="480"
              error={errors.duration_minutes?.message || errors.duration_custom?.message}
              {...register('duration_custom', { required: 'Enter minutes' })}
            />
          ) : (
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              error={errors.price?.message}
              {...register('price', { required: 'Price is required' })}
            />
          )}
        </div>
        {durationChoice === 'custom' && (
          <Input
            label="Price"
            type="number"
            step="0.01"
            min="0"
            error={errors.price?.message}
            {...register('price', { required: 'Price is required' })}
          />
        )}
      </form>
    </Modal>
  )
}
