import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

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
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
          <p className="text-slate-500 mt-1">Sign up to start booking flights</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                id="userName"
                type="text"
                value={form.userName}
                onChange={(e) => updateField('userName', e.target.value)}
                placeholder="Choose a username"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
              />
              {fieldErrors.userName && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.userName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="userEmail" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="userEmail"
                type="email"
                value={form.userEmail}
                onChange={(e) => updateField('userEmail', e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
              />
              {fieldErrors.userEmail && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.userEmail}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="userPhone" className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                id="userPhone"
                type="tel"
                value={form.userPhone}
                onChange={(e) => updateField('userPhone', e.target.value)}
                placeholder="10-digit phone number"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
              />
              {fieldErrors.userPhone && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.userPhone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="userPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="userPassword"
                type="password"
                value={form.userPassword}
                onChange={(e) => updateField('userPassword', e.target.value)}
                placeholder="Create a password"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
              />
              {fieldErrors.userPassword && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.userPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
