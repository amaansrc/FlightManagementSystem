import { createContext, useContext, useState, useCallback } from 'react';
import * as usersApi from '../api/users';

const AuthContext = createContext(null);

/**
 * Provides authentication state and actions to the component tree.
 *
 * State:
 *   - user: the logged-in User object (or null)
 *   - loading: true while an auth action is in progress
 *
 * Actions:
 *   - login(userName, userPassword) → logs in, sets user
 *   - signup(userData) → registers a new customer
 *   - logout() → invalidates session, clears user
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (userName, userPassword) => {
    setLoading(true);
    try {
      const loggedInUser = await usersApi.login(userName, userPassword);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (userData) => {
    setLoading(true);
    try {
      const created = await usersApi.register(userData);
      return created;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await usersApi.logout();
    } catch {
      // Even if the server call fails, clear the local state
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    userType: user?.userType || null,
    isAuthenticated: !!user,
    isAdmin: user?.userType === 'ADMIN',
    isCustomer: user?.userType === 'CUSTOMER',
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth state and actions.
 * Must be used within an <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
