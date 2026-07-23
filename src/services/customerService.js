import api from '@/services/api'

export const customerService = {
  list: (params) =>
    api.get('/customers', { params }).then((res) => res.data.data),

  get: (id) => api.get(`/customers/${id}`).then((res) => res.data.data),

  create: (data) => api.post('/customers', data).then((res) => res.data.data),

  update: (id, data) =>
    api.put(`/customers/${id}`, data).then((res) => res.data.data),

  remove: (id) => api.delete(`/customers/${id}`),

  lookup: (phone) =>
    api
      .get('/customers/lookup', { params: { phone } })
      .then((res) => res.data.data),
}
