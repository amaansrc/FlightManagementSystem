/**
 * Reusable flight result card — NovaPay dark theme.
 * Displays carrier, model, route, departure/arrival, price, seats, and a Book button.
 *
 * @param {Object}   scheduledFlight  - The ScheduledFlight object from the API
 * @param {Function} onBook           - Called when the user clicks "Book Now"
 * @param {boolean}  [showBook=true]  - Whether to show the Book Now button
 */
export default function FlightCard({ scheduledFlight, onBook, showBook = true }) {
  const { flight, schedule, availableSeats, ticketCost } = scheduledFlight;

  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '—';
    const d = new Date(dateTimeStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const d = new Date(dateTimeStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDuration = () => {
    if (!schedule?.departureTime || !schedule?.arrivalTime) return '';
    const dep = new Date(schedule.departureTime);
    const arr = new Date(schedule.arrivalTime);
    const diffMs = arr - dep;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  return (
    <div
      className="rounded-xl p-5 transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: 'rgba(4, 26, 83, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0, 89, 255, 0.3)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 89, 255, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Carrier & model info */}
        <div className="flex-shrink-0">
          <p className="font-semibold text-white">{flight?.carrierName}</p>
          <p className="text-xs" style={{ color: '#64748b' }}>
            {flight?.flightModel} · #{flight?.flightNumber}
          </p>
        </div>

        {/* Route & timing */}
        <div className="flex items-center gap-4 flex-1 justify-center">
          {/* Departure */}
          <div className="text-center">
            <p className="text-lg font-semibold text-white">
              {formatTime(schedule?.departureTime)}
            </p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>
              {schedule?.sourceAirport?.airportCode}
            </p>
          </div>

          {/* Duration line */}
          <div className="flex flex-col items-center flex-1 max-w-[140px]">
            <p className="text-xs mb-1" style={{ color: '#64748b' }}>{getDuration()}</p>
            <div className="w-full h-px relative" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                style={{ background: '#3B82F6' }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>Direct</p>
          </div>

          {/* Arrival */}
          <div className="text-center">
            <p className="text-lg font-semibold text-white">
              {formatTime(schedule?.arrivalTime)}
            </p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>
              {schedule?.destinationAirport?.airportCode}
            </p>
          </div>
        </div>

        {/* Price & book */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold" style={{ color: '#3B82F6' }}>
              ₹{ticketCost?.toLocaleString('en-IN') || '—'}
            </p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>{availableSeats} seats left</p>
          </div>

          {showBook && onBook && (
            <button
              onClick={onBook}
              disabled={availableSeats <= 0}
              className="btn-accent px-5 py-2 text-sm"
            >
              Book Now
            </button>
          )}
        </div>
      </div>

      {/* Date row */}
      <div
        className="mt-3 pt-3 flex justify-between text-xs"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          color: '#64748b',
        }}
      >
        <span>{formatDate(schedule?.departureTime)}</span>
        <span>
          {schedule?.sourceAirport?.airportLocation} → {schedule?.destinationAirport?.airportLocation}
        </span>
      </div>
    </div>
  );
}
