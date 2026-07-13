import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBooking, deleteBooking } from '../../api/bookings';

/**
 * Single booking detail page — full info + cancel action.
 */
export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getBooking(id);
        setBooking(data);
      } catch (err) {
        setError(err.message || 'Failed to load booking.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await deleteBooking(id);
      navigate('/bookings', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to cancel booking.');
      setShowCancelModal(false);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500">Loading booking…</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate('/bookings')}
          className="mt-4 text-sm text-primary hover:underline bg-transparent border-none cursor-pointer"
        >
          Back to My Bookings
        </button>
      </div>
    );
  }

  const { flight: scheduledFlight, passengerList } = booking;
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
    <div className="px-4 py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Booking Details</h1>
          <p className="text-sm text-slate-400 mt-1">
            Booking ID: <span className="font-mono">{booking.bookingId}</span>
          </p>
        </div>
        <span
          className={`text-sm font-medium px-3 py-1.5 rounded-full ${
            isCancelled
              ? 'bg-red-50 text-red-600'
              : 'bg-green-50 text-green-600'
          }`}
        >
          {isCancelled ? 'Cancelled' : 'Confirmed'}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Flight info */}
      {scheduledFlight && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Flight Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Carrier</span>
              <p className="text-slate-800 font-medium">{scheduledFlight.flight?.carrierName || '—'}</p>
            </div>
            <div>
              <span className="text-slate-400">Flight Model</span>
              <p className="text-slate-800 font-medium">{scheduledFlight.flight?.flightModel || '—'}</p>
            </div>
            <div>
              <span className="text-slate-400">Route</span>
              <p className="text-slate-800 font-medium">
                {scheduledFlight.schedule?.sourceAirport?.airportCode} →{' '}
                {scheduledFlight.schedule?.destinationAirport?.airportCode}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Booking Date</span>
              <p className="text-slate-800 font-medium">{formatDate(booking.bookingDate)}</p>
            </div>
            <div>
              <span className="text-slate-400">Departure</span>
              <p className="text-slate-800 font-medium">
                {formatDate(scheduledFlight.schedule?.departureTime)}{' '}
                {formatTime(scheduledFlight.schedule?.departureTime)}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Arrival</span>
              <p className="text-slate-800 font-medium">
                {formatDate(scheduledFlight.schedule?.arrivalTime)}{' '}
                {formatTime(scheduledFlight.schedule?.arrivalTime)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Passengers */}
      {passengerList && passengerList.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Passengers ({passengerList.length})
          </h2>
          <div className="space-y-3">
            {passengerList.map((p, i) => (
              <div
                key={p.pnrNumber || i}
                className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.passengerName}</p>
                  <p className="text-xs text-slate-400">
                    Age: {p.passengerAge} · Luggage: {p.luggage || 0} kg
                  </p>
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
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Total Cost</span>
          <span className="text-xl font-bold text-slate-800">
            ₹{booking.ticketCost?.toLocaleString('en-IN') || '—'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/bookings')}
          className="flex-1 bg-white text-slate-700 py-3 rounded-lg text-sm font-medium border border-slate-300 hover:bg-slate-50 cursor-pointer"
        >
          ← Back to My Bookings
        </button>
        {!isCancelled && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex-1 bg-red-50 text-red-600 py-3 rounded-lg text-sm font-medium border border-red-200 hover:bg-red-100 cursor-pointer"
          >
            Cancel Booking
          </button>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Cancel Booking?</h3>
            <p className="text-sm text-slate-500 mb-6">
              This action cannot be undone. Your seats will be released and the booking will be marked as cancelled.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 bg-white text-slate-700 py-2.5 rounded-lg text-sm font-medium border border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
