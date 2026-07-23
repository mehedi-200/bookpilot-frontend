import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import { Input, Textarea } from '@/components/Field'
import { useToast } from '@/components/Toast'
import { applyServerErrors } from '@/hooks/useAuth'
import { customerService } from '@/services/customerService'

// Shared by the Customers page and (in Feature 5) the booking flow.
export default function CustomerFormModal({ open, onClose, onSaved, customer = null }) {
  const toast = useToast()
  const navigate = useNavigate()
  const isNew = !customer
  const [duplicate, setDuplicate] = useState(null) // { id, name }

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    values: {
      name: customer?.name ?? '',
      phone: customer?.phone ?? '',
      email: customer?.email ?? '',
      notes: customer?.notes ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: (form) => {
      const data = { ...form, email: form.email || null, notes: form.notes || null }
      return isNew
        ? customerService.create(data)
        : customerService.update(customer.id, data)
    },
    onSuccess: (saved) => {
      toast.success(isNew ? 'Customer added' : 'Customer updated')
      setDuplicate(null)
      reset()
      onSaved(saved)
    },
    onError: (err) => {
      const existing = err.response?.data?.errors?.existing_customer
      if (existing) {
        setDuplicate(existing)
      }
      if (!applyServerErrors(err, setError)) {
        if (!existing) toast.error('Could not save customer')
      }
    },
  })

  const close = () => {
    setDuplicate(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={isNew ? 'Add customer' : `Edit ${customer?.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} onClick={handleSubmit((d) => mutation.mutate(d))}>
            {isNew ? 'Add customer' : 'Save changes'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <Input
          label="Name"
          placeholder="Rahim Uddin"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="01712-345678"
          error={errors.phone?.message}
          {...register('phone', { required: 'Phone is required' })}
        />
        {duplicate && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface-2 p-3">
            <p className="text-sm text-ink">
              This number belongs to <span className="font-medium">{duplicate.name}</span>.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                close()
                navigate(`/customers/${duplicate.id}`)
              }}
            >
              Open profile
            </Button>
          </div>
        )}
        <Input label="Email (optional)" type="email" error={errors.email?.message} {...register('email')} />
        <Textarea
          label="Notes (optional)"
          placeholder="Prefers mornings, has two cars…"
          {...register('notes')}
        />
      </form>
    </Modal>
  )
}
