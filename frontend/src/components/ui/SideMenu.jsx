import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import StaggeredMenu from './StaggeredMenu';
import './SideMenu.css';

/**
 * Re-themed StaggeredMenu for FlightBook.
 * Dark palette, NovaPay blue accent, wired to auth-based navigation.
 */
export default function SideMenu({ visible = true }) {
  const { isAuthenticated, isAdmin, isCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Build items based on auth state — same source of truth as NavBar
  const items = [];

  items.push({ label: 'Home', ariaLabel: 'Go to home page', link: '/' });

  if (!isAuthenticated) {
    items.push({ label: 'Login', ariaLabel: 'Sign in', link: '/login' });
    items.push({ label: 'Sign Up', ariaLabel: 'Create account', link: '/signup' });
  }

  if (isCustomer) {
    items.push({ label: 'Dashboard', ariaLabel: 'Customer dashboard', link: '/dashboard' });
    items.push({ label: 'Flights', ariaLabel: 'Search flights', link: '/flights/search' });
    items.push({ label: 'Bookings', ariaLabel: 'My bookings', link: '/bookings' });
  }

  if (isAdmin) {
    items.push({ label: 'Dashboard', ariaLabel: 'Admin dashboard', link: '/admin' });
    items.push({ label: 'Flights', ariaLabel: 'Manage flights', link: '/admin/flights' });
    items.push({ label: 'Schedules', ariaLabel: 'Manage schedules', link: '/admin/scheduled-flights' });
  }

  if (!visible) return null;

  return (
    <StaggeredMenu
      position="right"
      items={items}
      socialItems={[]}
      displaySocials={false}
      displayItemNumbering={true}
      menuButtonColor="#fff"
      openMenuButtonColor="#fff"
      changeMenuColorOnOpen={true}
      colors={['#041A53', '#0059FF']}
      accentColor="#3B82F6"
      isFixed={true}
      closeOnClickAway={true}
      className={`flightbook-side-menu ${isAuthenticated ? 'shifted-menu' : ''}`}
    />
  );
}
