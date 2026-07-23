import api from '@/services/api'

export const authService = {
  login: (email, password) =>
    api.post('/login', { email, password }).then((res) => res.data.data),

  logout: () => api.post('/logout'),

  getProfile: () => api.get('/profile').then((res) => res.data.data),

  updateProfile: (data) =>
    api.put('/profile', data).then((res) => res.data.data),
}
