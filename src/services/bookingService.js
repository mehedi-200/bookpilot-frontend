import api from '@/services/api'

export const bookingService = {
  list: (params) => api.get('/bookings', { params }).then((res) => res.data.data),

  get: (id) => api.get(`/bookings/${id}`).then((res) => res.data.data),

  create: (data) => api.post('/bookings', data).then((res) => res.data.data),

  updateStatus: (id, status, cancelReason) =>
    api
      .patch(`/bookings/${id}/status`, { status, cancel_reason: cancelReason })
      .then((res) => res.data.data),

  reschedule: (id, startsAt) =>
    api
      .patch(`/bookings/${id}/reschedule`, { starts_at: startsAt })
      .then((res) => res.data.data),

  // → { slots: { morning, afternoon, evening }, total, closed_reason, timezone }
  availability: (serviceId, date) =>
    api
      .get('/availability', { params: { service_id: serviceId, date } })
      .then((res) => res.data.data),
}
