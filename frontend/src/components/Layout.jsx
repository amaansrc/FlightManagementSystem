import { Outlet } from 'react-router-dom';
import NavBar from './ui/NavBar';

/**
 * Shared application layout — NovaPay dark theme.
 * Renders the glassmorphic NavBar at the top and the matched
 * child route below via <Outlet />.
 */
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      {/* ── Glassmorphic Navbar ── */}
      <NavBar />

      {/* ── Page content (padded for fixed navbar) ── */}
      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-6 text-center text-sm"
        style={{
          color: '#64748b',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(3, 9, 35, 0.6)',
        }}
      >
        <span className="text-[#3B82F6]">✈</span> © 2026 FlightBook — Flight Management System
      </footer>
    </div>
  );
}
