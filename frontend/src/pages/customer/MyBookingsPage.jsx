import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getAllBookings } from '../../api/bookings';
import BookingCard from '../../components/BookingCard';

/**
 * My bookings page — lists all bookings for the logged-in user.
 * Since GET /api/bookings returns ALL bookings (no userId filter on the server),
 * we filter client-side by the logged-in user's userId.
 */
export default function MyBookingsPage() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'confirmed' | 'cancelled'

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getAllBookings();
        // Client-side filter: only show bookings for this user
        const userBookings = data.filter(
          (b) => String(b.userId?.userId) === String(user?.userId)
        );
        setBookings(userBookings);
      } catch (err) {
        setError(err.message || 'Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user?.userId]);

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'confirmed') return b.bookingState !== 'CANCELLED';
    if (filter === 'cancelled') return b.bookingState === 'CANCELLED';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500">Loading your bookings…</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Bookings</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'confirmed', label: 'Confirmed' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-none transition-colors ${
              filter === tab.key
                ? 'bg-primary text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking list */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 text-lg">
            {bookings.length === 0
              ? 'You have no bookings yet.'
              : 'No bookings match this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <BookingCard key={b.bookingId} booking={b} />
          ))}
        </div>
      )}
    </div>
  );
}
