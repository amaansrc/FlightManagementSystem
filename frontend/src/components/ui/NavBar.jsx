import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Plane, LogOut } from 'lucide-react';

/**
 * Glassmorphic navigation bar for the NovaPay dark theme.
 * - Sticky at the top with frosted glass background
 * - Desktop: shows nav links + user badge
 * - Mobile (< md): shows hamburger that opens the SideMenu
 */
export default function NavBar({ onMenuToggle }) {
  const { isAuthenticated, isAdmin, isCustomer, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div
        className="mx-4 mt-3 rounded-2xl pl-6 pr-28 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(4, 26, 83, 0.4)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline group">
          <img src="/airplane-logo.svg" alt="FlightBook Logo" className="w-6 h-6" />
          <span className="text-lg font-bold text-white tracking-tight">FlightBook</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className="text-sm text-[#94A3B8] hover:text-white no-underline transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm bg-[#0059FF] text-white px-5 py-2 rounded-xl hover:bg-[#3B82F6] no-underline transition-colors font-medium"
              >
                Sign Up
              </Link>
            </>
          )}

          {isCustomer && (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-[#94A3B8] hover:text-white no-underline transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/flights/search"
                className="text-sm text-[#94A3B8] hover:text-white no-underline transition-colors"
              >
                Search Flights
              </Link>
              <Link
                to="/bookings"
                className="text-sm text-[#94A3B8] hover:text-white no-underline transition-colors"
              >
                My Bookings
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                to="/admin"
                className="text-sm text-[#94A3B8] hover:text-white no-underline transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/flights"
                className="text-sm text-[#94A3B8] hover:text-white no-underline transition-colors"
              >
                Flights
              </Link>
              <Link
                to="/admin/scheduled-flights"
                className="text-sm text-[#94A3B8] hover:text-white no-underline transition-colors"
              >
                Schedules
              </Link>
            </>
          )}

          {isAuthenticated && (
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
              <span className="text-sm text-[#94A3B8]">
                {user?.userName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 cursor-pointer bg-transparent border-none transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
