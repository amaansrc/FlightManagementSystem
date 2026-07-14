import { Outlet } from 'react-router-dom';
import NavBar from './ui/NavBar';
import SideMenu from './ui/SideMenu';
import ColorBends from './ui/ColorBends';

/**
 * Shared application layout — NovaPay dark theme.
 * Renders the glassmorphic NavBar at the top and the matched
 * child route below via <Outlet />.
 */
export default function Layout() {
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-hero">
      {/* Full-viewport ColorBends — fixed so it covers top→bottom at all scroll positions */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-70" aria-hidden="true">
        <ColorBends
          colors={['#0059FF']}
          rotation={90}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1.2}
          noise={0.15}
          parallax={0.5}
          iterations={1}
          intensity={1.5}
          bandWidth={6}
          transparent
        />
      </div>

      <SideMenu />
      {/* ── Glassmorphic Navbar ── */}
      <NavBar />

      {/* ── Page content (padded for fixed navbar) ── */}
      <main className="relative z-10 flex-1 pt-20">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer
        className="relative z-10 px-6 py-6 text-center text-sm"
        style={{
          color: '#64748b',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(3, 9, 35, 0.35)',
        }}
      >
        <span className="text-[#3B82F6]">✈</span> © 2026 FlightBook — Flight Management System
      </footer>
    </div>
  );
}
