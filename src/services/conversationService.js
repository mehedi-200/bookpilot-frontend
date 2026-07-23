import api from '@/services/api'

export const conversationService = {
  list: (params) =>
    api.get('/conversations', { params }).then((res) => res.data.data),

  // → conversation + full transcript (messages incl. tool calls) + bookings
  get: (id) => api.get(`/conversations/${id}`).then((res) => res.data.data),
}
