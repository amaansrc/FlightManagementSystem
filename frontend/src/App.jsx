import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import router from './router';

/**
 * Root application component.
 * Wraps the router in the AuthProvider for global auth state.
 */
export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
