import { Link } from 'react-router-dom';

/**
 * Reusable booking summary card for the "My Bookings" list.
 *
 * @param {Object} booking - The Booking object from the API
 */
export default function BookingCard({ booking }) {
  const { flight: scheduledFlight } = booking;
  const isCancelled = booking.bookingState === 'CANCELLED';

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '—';
    const d = new Date(dateTimeStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <Link
      to={`/bookings/${booking.bookingId}`}
      className="block glass-card p-5 hover:shadow-lg transition-all no-underline"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3B82F6'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs" style={{ color: '#94A3B8' }}>Booking ID</p>
          <p className="text-sm font-mono font-bold text-white">{booking.bookingId}</p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            isCancelled
              ? 'text-red-400'
              : 'text-green-400'
          }`}
          style={{
            background: isCancelled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'
          }}
        >
          {isCancelled ? 'Cancelled' : 'Confirmed'}
        </span>
      </div>

      {scheduledFlight && (
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-medium text-white">
            {scheduledFlight.schedule?.sourceAirport?.airportCode || '—'}
          </span>
          <span style={{ color: '#64748b' }}>→</span>
          <span className="text-sm font-medium text-white">
            {scheduledFlight.schedule?.destinationAirport?.airportCode || '—'}
          </span>
          <span className="text-xs ml-auto" style={{ color: '#94A3B8' }}>
            {scheduledFlight.flight?.carrierName}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs pt-3" style={{ color: '#94A3B8', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <span>
          {formatDate(scheduledFlight?.schedule?.departureTime)}{' '}
          {formatTime(scheduledFlight?.schedule?.departureTime)}
        </span>
        <span>{booking.noOfPassengers} passenger{booking.noOfPassengers > 1 ? 's' : ''}</span>
        <span className="font-medium text-white">
          ₹{booking.ticketCost?.toLocaleString('en-IN') || '—'}
        </span>
      </div>
    </Link>
  );
}
