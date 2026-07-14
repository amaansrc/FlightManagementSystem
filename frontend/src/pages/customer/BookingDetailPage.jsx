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
        <p style={{ color: '#94A3B8' }}>Loading booking…</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => navigate('/bookings')}
          className="mt-4 text-sm hover:underline bg-transparent border-none cursor-pointer"
          style={{ color: '#3B82F6' }}
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
          <h1 className="text-2xl font-bold text-white">Booking Details</h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
            Booking ID: <span className="font-mono text-white">{booking.bookingId}</span>
          </p>
        </div>
        <span
          className={`text-sm font-medium px-3 py-1.5 rounded-full ${
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

      {/* Flight info */}
      {scheduledFlight && (
        <div className="glass-card p-5 mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#94A3B8' }}>
            Flight Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span style={{ color: '#64748b' }}>Carrier</span>
              <p className="text-white font-medium">{scheduledFlight.flight?.carrierName || '—'}</p>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Flight Model</span>
              <p className="text-white font-medium">{scheduledFlight.flight?.flightModel || '—'}</p>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Route</span>
              <p className="text-white font-medium">
                {scheduledFlight.schedule?.sourceAirport?.airportCode} →{' '}
                {scheduledFlight.schedule?.destinationAirport?.airportCode}
              </p>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Booking Date</span>
              <p className="text-white font-medium">{formatDate(booking.bookingDate)}</p>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Departure</span>
              <p className="text-white font-medium">
                {formatDate(scheduledFlight.schedule?.departureTime)}{' '}
                {formatTime(scheduledFlight.schedule?.departureTime)}
              </p>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Arrival</span>
              <p className="text-white font-medium">
                {formatDate(scheduledFlight.schedule?.arrivalTime)}{' '}
                {formatTime(scheduledFlight.schedule?.arrivalTime)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Passengers */}
      {passengerList && passengerList.length > 0 && (
        <div className="glass-card p-5 mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#94A3B8' }}>
            Passengers ({passengerList.length})
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
                  <p className="text-xs" style={{ color: '#94A3B8' }}>
                    Age: {p.passengerAge} · Luggage: {p.luggage || 0} kg
                  </p>
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
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: '#94A3B8' }}>Total Cost</span>
          <span className="text-xl font-bold text-white">
            ₹{booking.ticketCost?.toLocaleString('en-IN') || '—'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/bookings')}
          className="flex-1 glass-card py-3 text-sm font-medium text-white hover:bg-white/5 cursor-pointer"
        >
          ← Back to My Bookings
        </button>
        {!isCancelled && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex-1 py-3 rounded-lg text-sm font-medium cursor-pointer transition-colors"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171'
            }}
          >
            Cancel Booking
          </button>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Cancel Booking?</h3>
            <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
              This action cannot be undone. Your seats will be released and the booking will be marked as cancelled.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 glass-card py-2.5 text-sm font-medium text-white hover:bg-white/5 cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
                style={{
                  background: 'rgba(239, 68, 68, 0.8)',
                  color: 'white',
                  border: 'none'
                }}
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
