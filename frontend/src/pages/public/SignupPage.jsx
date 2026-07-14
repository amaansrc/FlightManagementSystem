import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

import { Plane } from 'lucide-react';

/**
 * Signup page — customer registration form.
 * Fields: username, email, phone, password, confirm password.
 * No DOB field (not in backend User model).
 */
export default function SignupPage() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    userPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Client-side validation — mirrors backend rules:
   * - Phone: exactly 10 digits, must not start with 0
   * - Email: local part starts with alphanumeric
   * - Password match
   */
  const validate = () => {
    const errors = {};

    if (!form.userName.trim()) {
      errors.userName = 'Username is required.';
    }

    if (!form.userEmail.trim()) {
      errors.userEmail = 'Email is required.';
    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9]*@.+\..+$/.test(form.userEmail)) {
      errors.userEmail = 'Enter a valid email (must start with an alphanumeric character).';
    }

    if (!form.userPhone.trim()) {
      errors.userPhone = 'Phone number is required.';
    } else if (!/^[1-9]\d{9}$/.test(form.userPhone)) {
      errors.userPhone = 'Phone must be exactly 10 digits and not start with 0.';
    }

    if (!form.userPassword) {
      errors.userPassword = 'Password is required.';
    } else if (form.userPassword.length < 4) {
      errors.userPassword = 'Password must be at least 4 characters.';
    }

    if (form.userPassword !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    try {
      await signup({
        userName: form.userName.trim(),
        userEmail: form.userEmail.trim(),
        userPhone: form.userPhone.trim(),
        userPassword: form.userPassword,
        userType: 'CUSTOMER',
      });
      // Redirect to login with a success indicator
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-float-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'rgba(0, 89, 255, 0.15)' }}>
            <img src="/airplane-logo.svg" alt="FlightBook Logo" className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-semibold text-white">Create Account</h1>
          <p className="mt-2" style={{ color: '#94A3B8' }}>Sign up to start booking flights</p>
        </div>

        {/* Form card */}
        <div className="glass-card p-8 animate-float-up" style={{ animationDelay: '0.2s' }}>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="userName" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
                Username
              </label>
              <input
                id="userName"
                type="text"
                value={form.userName}
                onChange={(e) => updateField('userName', e.target.value)}
                placeholder="Choose a username"
                className="glass-input w-full px-4 py-3 text-sm"
              />
              {fieldErrors.userName && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.userName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="userEmail" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
                Email
              </label>
              <input
                id="userEmail"
                type="email"
                value={form.userEmail}
                onChange={(e) => updateField('userEmail', e.target.value)}
                placeholder="you@example.com"
                className="glass-input w-full px-4 py-3 text-sm"
              />
              {fieldErrors.userEmail && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.userEmail}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="userPhone" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
                Phone Number
              </label>
              <input
                id="userPhone"
                type="tel"
                value={form.userPhone}
                onChange={(e) => updateField('userPhone', e.target.value)}
                placeholder="10-digit phone number"
                className="glass-input w-full px-4 py-3 text-sm"
              />
              {fieldErrors.userPhone && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.userPhone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="userPassword" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
                Password
              </label>
              <input
                id="userPassword"
                type="password"
                value={form.userPassword}
                onChange={(e) => updateField('userPassword', e.target.value)}
                placeholder="Create a password"
                className="glass-input w-full px-4 py-3 text-sm"
              />
              {fieldErrors.userPassword && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.userPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                placeholder="Re-enter your password"
                className="glass-input w-full px-4 py-3 text-sm"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full py-3 text-sm mt-4"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm mt-6" style={{ color: '#94A3B8' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium hover:underline transition-colors" style={{ color: '#3B82F6' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
