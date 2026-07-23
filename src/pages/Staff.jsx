import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, UserX, UserCheck, Pencil, UsersRound } from 'lucide-react'
import DataList from '@/components/DataList'
import Button, { IconButton } from '@/components/Button'
import { Input, Select } from '@/components/Field'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import SearchInput from '@/components/SearchInput'
import StatusChip from '@/components/StatusChip'
import { useToast } from '@/components/Toast'
import Avatar from '@/components/Avatar'
import { useAuth, applyServerErrors } from '@/hooks/useAuth'
import { userService } from '@/services/userService'
import { friendlyDate } from '@/utils/dates'

export default function Staff() {
  const { user: me } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | user object
  const [deactivating, setDeactivating] = useState(null)

  const params = { page, per_page: perPage, q: q || undefined }
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.list(params),
    placeholderData: (prev) => prev,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] })

  const toggleMutation = useMutation({
    mutationFn: (user) => userService.toggleActive(user.id),
    onSuccess: (updated) => {
      invalidate()
      setDeactivating(null)
      toast.success(updated.active ? 'Account activated' : 'Account deactivated')
    },
    onError: () => toast.error('Could not update the account'),
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  return (
    <>
      <DataList
        columns={[
          {
            key: 'name',
            header: 'Name',
            render: (u) => (
              <span className="flex items-center gap-2.5 font-medium">
                <Avatar name={u.name} />
                {u.name}
                {u.id === me?.id && (
                  <span className="text-xs text-ink-muted">(you)</span>
                )}
              </span>
            ),
          },
          { key: 'email', header: 'Email', className: 'text-ink-muted' },
          {
            key: 'role',
            header: 'Role',
            render: (u) => (
              <StatusChip tone={u.role === 'admin' ? 'accent' : 'neutral'}>
                {u.role}
              </StatusChip>
            ),
          },
          {
            key: 'active',
            header: 'Status',
            render: (u) => (
              <StatusChip tone={u.active ? 'ok' : 'danger'}>
                {u.active ? 'active' : 'inactive'}
              </StatusChip>
            ),
          },
          {
            key: 'created_at',
            header: 'Added',
            className: 'text-ink-muted',
            render: (u) => friendlyDate(u.created_at),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-24',
            render: (u) => <RowActions user={u} me={me} onEdit={setEditing} onToggle={(target) => (target.active ? setDeactivating(target) : toggleMutation.mutate(target))} />,
          },
        ]}
        rows={rows}
        loading={isLoading}
        renderCard={(u) => (
          <div className="flex items-center gap-3">
            <Avatar name={u.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {u.name}{' '}
                {u.id === me?.id && <span className="text-xs text-ink-muted">(you)</span>}
              </p>
              <p className="truncate text-xs text-ink-muted">{u.email}</p>
            </div>
            <StatusChip tone={u.role === 'admin' ? 'accent' : 'neutral'}>{u.role}</StatusChip>
            {!u.active && <StatusChip tone="danger">inactive</StatusChip>}
            <RowActions user={u} me={me} onEdit={setEditing} onToggle={(target) => (target.active ? setDeactivating(target) : toggleMutation.mutate(target))} />
          </div>
        )}
        toolbar={
          <>
            <Button onClick={() => setEditing('new')}>
              <Plus size={16} /> Add staff
            </Button>
            <SearchInput
              className="w-full md:ml-auto md:w-64"
              placeholder="Search name or email…"
              value={q}
              onChange={(next) => {
                setQ(next)
                setPage(1)
              }}
            />
          </>
        }
        empty={{
          icon: UsersRound,
          title: q ? `No staff matching “${q}”` : 'No staff accounts yet',
          hint: q ? undefined : 'Add your team so they can manage bookings with you.',
          action: !q && (
            <Button onClick={() => setEditing('new')}>
              <Plus size={16} /> Add staff
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

      <UserFormModal
        key={editing === 'new' ? 'new' : (editing?.id ?? 'closed')}
        editing={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          invalidate()
          setEditing(null)
        }}
      />

      <ConfirmModal
        open={!!deactivating}
        onClose={() => setDeactivating(null)}
        onConfirm={() => toggleMutation.mutate(deactivating)}
        loading={toggleMutation.isPending}
        danger
        title={`Deactivate ${deactivating?.name}?`}
        message="They can no longer log in. Their bookings and history are kept. You can reactivate them anytime."
        confirmLabel="Deactivate"
      />
    </>
  )
}

function RowActions({ user, me, onEdit, onToggle }) {
  return (
    <span className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <IconButton label="Edit" onClick={() => onEdit(user)}>
        <Pencil size={15} />
      </IconButton>
      {user.id !== me?.id && (
        <IconButton
          label={user.active ? 'Deactivate' : 'Activate'}
          onClick={() => onToggle(user)}
        >
          {user.active ? (
            <UserX size={15} className="text-danger" />
          ) : (
            <UserCheck size={15} className="text-ok" />
          )}
        </IconButton>
      )}
    </span>
  )
}

function UserFormModal({ editing, onClose, onSaved }) {
  const toast = useToast()
  const isNew = editing === 'new'
  const open = !!editing

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: isNew
      ? { name: '', email: '', password: '', role: 'staff' }
      : { name: editing?.name, email: editing?.email, password: '', role: editing?.role },
  })

  const mutation = useMutation({
    mutationFn: (data) => {
      if (!data.password) delete data.password
      return isNew ? userService.create(data) : userService.update(editing.id, data)
    },
    onSuccess: () => {
      toast.success(isNew ? 'Staff member added' : 'Staff member updated')
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
      title={isNew ? 'Add staff member' : `Edit ${editing?.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} onClick={handleSubmit((d) => mutation.mutate(d))}>
            {isNew ? 'Add staff' : 'Save changes'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <Input
          label="Name"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          label={isNew ? 'Password' : 'New password'}
          type="password"
          autoComplete="new-password"
          hint={isNew ? undefined : 'Leave blank to keep the current password'}
          error={errors.password?.message}
          {...register('password', {
            required: isNew ? 'Password is required' : false,
            minLength: { value: 8, message: 'At least 8 characters' },
          })}
        />
        <Select label="Role" error={errors.role?.message} {...register('role')}>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </Select>
      </form>
    </Modal>
  )
}
