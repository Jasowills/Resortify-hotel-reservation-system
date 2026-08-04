import { Navigate, Route, Routes } from 'react-router-dom';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import Landing from '@/pages/Landing';
import Rooms from '@/pages/Rooms';
import RoomDetail from '@/pages/RoomDetail';
import Booking from '@/pages/Booking';
import Auth from '@/pages/Auth';
import MyStays from '@/pages/MyStays';
import AdminLayout from '@/pages/admin/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import AdminReservations from '@/pages/admin/AdminReservations';
import AdminRooms from '@/pages/admin/AdminRooms';
import AdminUsers from '@/pages/admin/AdminUsers';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/booking"
            element={
              <RequireAuth>
                <Booking />
              </RequireAuth>
            }
          />
          <Route
            path="/stays"
            element={
              <RequireAuth>
                <MyStays />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="guests" element={<AdminUsers />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
