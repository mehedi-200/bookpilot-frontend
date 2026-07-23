import api from '@/services/api'

export const dashboardService = {
  // One request for the whole page: stats, needs_attention, today,
  // upcoming, by_status, ai_share, setup_state.
  get: () => api.get('/dashboard').then((res) => res.data.data),
}
