import api from '@/services/api'

export const businessService = {
  // → { business, setup_state }
  get: () => api.get('/business').then((res) => res.data.data),

  update: (data) => api.put('/business', data).then((res) => res.data.data),

  regenerateWidgetKey: () =>
    api.post('/business/widget-key/regenerate').then((res) => res.data.data),
}

export const workingHoursService = {
  // → { days: [7], closed_dates: [...] }
  get: () => api.get('/working-hours').then((res) => res.data.data),

  update: (days) =>
    api.put('/working-hours', { days }).then((res) => res.data.data),

  addClosedDate: (data) =>
    api.post('/closed-dates', data).then((res) => res.data.data),

  removeClosedDate: (id) => api.delete(`/closed-dates/${id}`),
}
