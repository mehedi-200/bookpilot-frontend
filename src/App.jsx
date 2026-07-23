import { Routes, Route } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import PublicLayout from '@/layouts/PublicLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import RequireAdmin from '@/components/RequireAdmin'
import Landing from '@/pages/public/Landing'
import Pricing from '@/pages/public/Pricing'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import UiKit from '@/pages/UiKit'
import Profile from '@/pages/Profile'
import Staff from '@/pages/Staff'
import Services from '@/pages/Services'
import Settings from '@/pages/Settings'
import Customers from '@/pages/Customers'
import CustomerDetail from '@/pages/customers/CustomerDetail'
import Bookings from '@/pages/Bookings'
import BookingDetail from '@/pages/bookings/BookingDetail'
import Dashboard from '@/pages/Dashboard'
import Integrations from '@/pages/Integrations'
import Search from '@/pages/Search'
import Conversations from '@/pages/Conversations'
import ConversationDetail from '@/pages/conversations/ConversationDetail'

function App() {
  return (
    <Routes>
      {/* Public pages — all share one header, login included */}
      <Route element={<PublicLayout />}>
        <Route path="/welcome" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/bookings/:id" element={<BookingDetail />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/conversations/:id" element={<ConversationDetail />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/services" element={<Services />} />
        <Route
          path="/staff"
          element={
            <RequireAdmin>
              <Staff />
            </RequireAdmin>
          }
        />
        <Route
          path="/integrations"
          element={
            <RequireAdmin>
              <Integrations />
            </RequireAdmin>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAdmin>
              <Settings />
            </RequireAdmin>
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/ui-kit" element={<UiKit />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
