import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './auth/RequireAuth';

// ── Public pages ──
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import SignupPage from './pages/public/SignupPage';

// ── Customer pages ──
import DashboardPage from './pages/customer/DashboardPage';
import SearchFlightsPage from './pages/customer/SearchFlightsPage';
import BookingFormPage from './pages/customer/BookingFormPage';
import ConfirmationPage from './pages/customer/ConfirmationPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import BookingDetailPage from './pages/customer/BookingDetailPage';

// ── Admin pages ──
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import FlightManagementPage from './pages/admin/FlightManagementPage';
import ScheduledFlightManagementPage from './pages/admin/ScheduledFlightManagementPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // ── Public routes ──
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },

      // ── Customer routes (require CUSTOMER role) ──
      {
        path: 'dashboard',
        element: (
          <RequireAuth role="CUSTOMER">
            <DashboardPage />
          </RequireAuth>
        ),
      },
      {
        path: 'flights/search',
        element: (
          <RequireAuth role="CUSTOMER">
            <SearchFlightsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'bookings/new',
        element: (
          <RequireAuth role="CUSTOMER">
            <BookingFormPage />
          </RequireAuth>
        ),
      },
      {
        path: 'bookings/:id/confirmation',
        element: (
          <RequireAuth role="CUSTOMER">
            <ConfirmationPage />
          </RequireAuth>
        ),
      },
      {
        path: 'bookings',
        element: (
          <RequireAuth role="CUSTOMER">
            <MyBookingsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'bookings/:id',
        element: (
          <RequireAuth role="CUSTOMER">
            <BookingDetailPage />
          </RequireAuth>
        ),
      },

      // ── Admin routes (require ADMIN role) ──
      {
        path: 'admin',
        element: (
          <RequireAuth role="ADMIN">
            <AdminDashboardPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/flights',
        element: (
          <RequireAuth role="ADMIN">
            <FlightManagementPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/scheduled-flights',
        element: (
          <RequireAuth role="ADMIN">
            <ScheduledFlightManagementPage />
          </RequireAuth>
        ),
      },
    ],
  },
]);

export default router;
