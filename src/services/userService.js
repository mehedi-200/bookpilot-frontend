import api from '@/services/api'

export const userService = {
  // Returns Laravel paginator payload: { data: [...], meta, links }
  list: (params) => api.get('/users', { params }).then((res) => res.data.data),

  create: (data) => api.post('/users', data).then((res) => res.data.data),

  update: (id, data) =>
    api.put(`/users/${id}`, data).then((res) => res.data.data),

  toggleActive: (id) =>
    api.patch(`/users/${id}/toggle-active`).then((res) => res.data.data),
}
