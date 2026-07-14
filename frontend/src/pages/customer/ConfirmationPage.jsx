import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getBooking } from '../../api/bookings';

/**
 * Booking confirmation page — shows booking ID, flight details, and per-passenger PNR.
 * Receives the booking object via route state (from the just-completed POST),
 * or fetches it by ID if navigated to directly.
 */
export default function ConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!booking && id) {
      const fetchBooking = async () => {
        try {
          const data = await getBooking(id);
          setBooking(data);
        } catch (err) {
          setError(err.message || 'Failed to load booking details.');
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [booking, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p style={{ color: '#94A3B8' }}>Loading booking details…</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col">
        <p className="text-red-400">{error || 'Booking not found.'}</p>
        <button
          onClick={() => navigate('/bookings')}
          className="mt-4 text-sm hover:underline bg-transparent border-none cursor-pointer"
          style={{ color: '#3B82F6' }}
        >
          Go to My Bookings
        </button>
      </div>
    );
  }

  const { flight: scheduledFlight, passengerList } = booking;

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      {/* Success banner */}
      <div
        className="rounded-xl p-6 mb-6 text-center"
        style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}
      >
        <div className="text-3xl mb-2">✅</div>
        <h1 className="text-xl font-bold text-green-400">Booking Confirmed!</h1>
        <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
          Your booking ID is <span className="font-mono font-bold text-white">{booking.bookingId}</span>
        </p>
      </div>

      {/* Flight details */}
      {scheduledFlight && (
        <div className="glass-card p-5 mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#94A3B8' }}>
            Flight Details
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span style={{ color: '#64748b' }}>Carrier</span>
              <p className="text-white font-medium">
                {scheduledFlight.flight?.carrierName || '—'}
              </p>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Model</span>
              <p className="text-white font-medium">
                {scheduledFlight.flight?.flightModel || '—'}
              </p>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Route</span>
              <p className="text-white font-medium">
                {scheduledFlight.schedule?.sourceAirport?.airportCode || '—'} →{' '}
                {scheduledFlight.schedule?.destinationAirport?.airportCode || '—'}
              </p>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Date</span>
              <p className="text-white font-medium">{booking.bookingDate}</p>
            </div>
          </div>
        </div>
      )}

      {/* Passenger PNR list */}
      {passengerList && passengerList.length > 0 && (
        <div className="glass-card p-5 mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#94A3B8' }}>
            Passengers & PNR
          </h2>
          <div className="space-y-3">
            {passengerList.map((p, i) => (
              <div
                key={p.pnrNumber || i}
                className="flex items-center justify-between rounded-lg px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div>
                  <p className="text-sm font-medium text-white">{p.passengerName}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>Age: {p.passengerAge}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: '#94A3B8' }}>PNR</p>
                  <p className="text-sm font-mono font-bold" style={{ color: '#3B82F6' }}>{p.pnrNumber || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost */}
      <div className="glass-card p-5 mb-6">
        <div className="flex justify-between text-sm">
          <span style={{ color: '#94A3B8' }}>Total Cost</span>
          <span className="text-lg font-bold text-white">
            ₹{booking.ticketCost?.toLocaleString('en-IN') || '—'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/bookings')}
          className="flex-1 btn-accent py-3 text-sm"
        >
          Go to My Bookings
        </button>
        <button
          onClick={() => navigate('/flights/search')}
          className="flex-1 glass-card py-3 text-sm font-medium text-white hover:bg-white/5 cursor-pointer"
        >
          Book Another Flight
        </button>
      </div>
    </div>
  );
}
