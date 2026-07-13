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
      className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors no-underline"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-slate-400">Booking ID</p>
          <p className="text-sm font-mono font-bold text-slate-800">{booking.bookingId}</p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            isCancelled
              ? 'bg-red-50 text-red-600'
              : 'bg-green-50 text-green-600'
          }`}
        >
          {isCancelled ? 'Cancelled' : 'Confirmed'}
        </span>
      </div>

      {scheduledFlight && (
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-medium text-slate-800">
            {scheduledFlight.schedule?.sourceAirport?.airportCode || '—'}
          </span>
          <span className="text-slate-300">→</span>
          <span className="text-sm font-medium text-slate-800">
            {scheduledFlight.schedule?.destinationAirport?.airportCode || '—'}
          </span>
          <span className="text-xs text-slate-400 ml-auto">
            {scheduledFlight.flight?.carrierName}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
        <span>
          {formatDate(scheduledFlight?.schedule?.departureTime)}{' '}
          {formatTime(scheduledFlight?.schedule?.departureTime)}
        </span>
        <span>{booking.noOfPassengers} passenger{booking.noOfPassengers > 1 ? 's' : ''}</span>
        <span className="font-medium text-slate-700">
          ₹{booking.ticketCost?.toLocaleString('en-IN') || '—'}
        </span>
      </div>
    </Link>
  );
}
