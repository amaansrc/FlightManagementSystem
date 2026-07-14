import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Eye, EyeOff, Plane } from 'lucide-react';

/**
 * Login page — NovaPay dark glassmorphic design.
 * On success, redirects to /dashboard (CUSTOMER) or /admin (ADMIN).
 */
export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userName.trim() || !userPassword.trim()) {
      setError('Username and password are required.');
      return;
    }

    try {
      const user = await login(userName.trim(), userPassword);
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.userType === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-float-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'rgba(0, 89, 255, 0.15)' }}>
            <Plane className="w-7 h-7" style={{ color: '#3B82F6' }} />
          </div>
          <h1 className="text-3xl font-semibold text-white">Welcome Back</h1>
          <p className="mt-2" style={{ color: '#94A3B8' }}>Sign in to your FlightBook account</p>
        </div>

        {/* Form card */}
        <div
          className="glass-card p-8 animate-float-up"
          style={{ animationDelay: '0.2s' }}
        >
          {error && (
            <div
              className="mb-4 p-3 rounded-xl text-sm"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="userName" className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                Username
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your username"
                className="glass-input w-full px-4 py-3 text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="userPassword" className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="userPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="glass-input w-full px-4 py-3 pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center bg-transparent border-none cursor-pointer"
                  style={{ color: '#94A3B8' }}
                >
                  {showPassword
                    ? <EyeOff className="w-5 h-5 hover:text-white transition-colors" />
                    : <Eye className="w-5 h-5 hover:text-white transition-colors" />
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full py-3 text-sm"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm mt-6" style={{ color: '#94A3B8' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium hover:underline transition-colors" style={{ color: '#3B82F6' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
