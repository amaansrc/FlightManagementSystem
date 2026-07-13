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
        <p className="text-slate-500">Loading booking details…</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col">
        <p className="text-red-500">{error || 'Booking not found.'}</p>
        <button
          onClick={() => navigate('/bookings')}
          className="mt-4 text-sm text-primary hover:underline bg-transparent border-none cursor-pointer"
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
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <h1 className="text-xl font-bold text-green-800">Booking Confirmed!</h1>
        <p className="text-sm text-green-600 mt-1">
          Your booking ID is <span className="font-mono font-bold">{booking.bookingId}</span>
        </p>
      </div>

      {/* Flight details */}
      {scheduledFlight && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Flight Details
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-400">Carrier</span>
              <p className="text-slate-800 font-medium">
                {scheduledFlight.flight?.carrierName || '—'}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Model</span>
              <p className="text-slate-800 font-medium">
                {scheduledFlight.flight?.flightModel || '—'}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Route</span>
              <p className="text-slate-800 font-medium">
                {scheduledFlight.schedule?.sourceAirport?.airportCode || '—'} →{' '}
                {scheduledFlight.schedule?.destinationAirport?.airportCode || '—'}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Date</span>
              <p className="text-slate-800 font-medium">{booking.bookingDate}</p>
            </div>
          </div>
        </div>
      )}

      {/* Passenger PNR list */}
      {passengerList && passengerList.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Passengers & PNR
          </h2>
          <div className="space-y-3">
            {passengerList.map((p, i) => (
              <div
                key={p.pnrNumber || i}
                className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.passengerName}</p>
                  <p className="text-xs text-slate-400">Age: {p.passengerAge}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">PNR</p>
                  <p className="text-sm font-mono font-bold text-primary">{p.pnrNumber || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Total Cost</span>
          <span className="text-lg font-bold text-slate-800">
            ₹{booking.ticketCost?.toLocaleString('en-IN') || '—'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/bookings')}
          className="flex-1 bg-primary text-white py-3 rounded-lg text-sm font-medium hover:bg-primary-dark cursor-pointer"
        >
          Go to My Bookings
        </button>
        <button
          onClick={() => navigate('/flights/search')}
          className="flex-1 bg-white text-slate-700 py-3 rounded-lg text-sm font-medium border border-slate-300 hover:bg-slate-50 cursor-pointer"
        >
          Book Another Flight
        </button>
      </div>
    </div>
  );
}
