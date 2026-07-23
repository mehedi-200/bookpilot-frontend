import api from '@/services/api'

export const integrationService = {
  get: () => api.get('/integrations/garageflow').then((res) => res.data.data),

  update: (data) =>
    api.put('/integrations/garageflow', data).then((res) => res.data.data),

  test: () =>
    api.post('/integrations/garageflow/test').then((res) => res.data),

  mechanics: () =>
    api.get('/integrations/garageflow/mechanics').then((res) => res.data.data),

  syncBooking: (bookingId) =>
    api.post(`/bookings/${bookingId}/sync`).then((res) => res.data.data),
}
