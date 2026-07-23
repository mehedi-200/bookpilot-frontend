import { Routes, Route } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import RequireAdmin from '@/components/RequireAdmin'
import Login from '@/pages/Login'
import Placeholder from '@/pages/Placeholder'
import NotFound from '@/pages/NotFound'
import UiKit from '@/pages/UiKit'
import Profile from '@/pages/Profile'
import Staff from '@/pages/Staff'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Placeholder title="Dashboard" feature={9} />} />
        <Route path="/bookings" element={<Placeholder title="Bookings" feature={5} />} />
        <Route path="/conversations" element={<Placeholder title="Conversations" feature={6} />} />
        <Route path="/customers" element={<Placeholder title="Customers" feature={4} />} />
        <Route path="/services" element={<Placeholder title="Services" feature={3} />} />
        <Route path="/staff" element={<RequireAdmin><Staff /></RequireAdmin>} />
        <Route path="/integrations" element={<RequireAdmin><Placeholder title="Integrations" feature={8} /></RequireAdmin>} />
        <Route path="/settings" element={<RequireAdmin><Placeholder title="Settings" feature={3} /></RequireAdmin>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<Placeholder title="Search" feature={9} />} />
        <Route path="/ui-kit" element={<UiKit />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
