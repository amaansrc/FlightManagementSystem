import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Route guard component.
 *
 * Wraps routes that require authentication. Optionally restricts
 * access to a specific role ("ADMIN" or "CUSTOMER").
 *
 * Usage:
 *   <Route element={<RequireAuth />}>           — any logged-in user
 *   <Route element={<RequireAuth role="ADMIN" />}> — admin only
 *
 * Redirects:
 *   - Not authenticated → /login
 *   - Wrong role → /dashboard (customer) or /admin (admin)
 */
export default function RequireAuth({ role, children }) {
  const { isAuthenticated, userType } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserve the intended destination so login can redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && userType !== role) {
    // Authenticated but wrong role — send to their own dashboard
    const fallback = userType === 'ADMIN' ? '/admin' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
