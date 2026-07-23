import api from '@/services/api'

export const catalogService = {
  list: (params) =>
    api.get('/services', { params }).then((res) => res.data.data),

  create: (data) => api.post('/services', data).then((res) => res.data.data),

  update: (id, data) =>
    api.put(`/services/${id}`, data).then((res) => res.data.data),

  remove: (id) => api.delete(`/services/${id}`),

  toggleActive: (id) =>
    api.patch(`/services/${id}/toggle-active`).then((res) => res.data.data),
}
