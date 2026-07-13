import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * Shared application layout — renders a navbar at the top
 * and the matched child route below via <Outlet />.
 */
export default function Layout() {
  const { isAuthenticated, isAdmin, isCustomer, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        {/* Logo / Home link */}
        <Link to="/" className="text-xl font-bold text-primary no-underline">
          ✈ FlightBook
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-4">
          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className="text-sm text-slate-600 hover:text-primary no-underline"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark no-underline"
              >
                Sign Up
              </Link>
            </>
          )}

          {isCustomer && (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-slate-600 hover:text-primary no-underline"
              >
                Dashboard
              </Link>
              <Link
                to="/flights/search"
                className="text-sm text-slate-600 hover:text-primary no-underline"
              >
                Search Flights
              </Link>
              <Link
                to="/bookings"
                className="text-sm text-slate-600 hover:text-primary no-underline"
              >
                My Bookings
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                to="/admin"
                className="text-sm text-slate-600 hover:text-primary no-underline"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/flights"
                className="text-sm text-slate-600 hover:text-primary no-underline"
              >
                Flights
              </Link>
              <Link
                to="/admin/scheduled-flights"
                className="text-sm text-slate-600 hover:text-primary no-underline"
              >
                Schedules
              </Link>
            </>
          )}

          {isAuthenticated && (
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200">
              <span className="text-sm text-slate-500">
                {user?.userName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-danger hover:text-red-700 cursor-pointer bg-transparent border-none"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Page content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 text-center text-sm text-slate-400">
        © 2026 FlightBook — Flight Management System
      </footer>
    </div>
  );
}
