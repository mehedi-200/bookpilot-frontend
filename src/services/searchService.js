import api from '@/services/api'

export const searchService = {
  // → { bookings[], customers[], conversations[], total }
  search: (q) => api.get('/search', { params: { q } }).then((res) => res.data.data),
}

export const notificationService = {
  list: (params) =>
    api.get('/notifications', { params }).then((res) => res.data.data),

  unreadCount: () =>
    api.get('/notifications/unread-count').then((res) => res.data.data.count),

  markRead: (id) => api.patch(`/notifications/${id}/read`),

  markAllRead: () => api.patch('/notifications/read-all'),
}
