/**
 * Reusable flight result card.
 * Displays carrier, model, route, departure/arrival, price, seats, and a Book button.
 *
 * @param {Object}   scheduledFlight  - The ScheduledFlight object from the API
 * @param {Function} onBook           - Called when the user clicks "Book Now"
 * @param {boolean}  [showBook=true]  - Whether to show the Book Now button
 */
export default function FlightCard({ scheduledFlight, onBook, showBook = true }) {
  const { flight, schedule, availableSeats, ticketCost } = scheduledFlight;

  // Format datetime string to readable time
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

  // Calculate duration
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
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Carrier & model info */}
        <div className="flex-shrink-0">
          <p className="font-semibold text-slate-800">{flight?.carrierName}</p>
          <p className="text-xs text-slate-400">{flight?.flightModel} · #{flight?.flightNumber}</p>
        </div>

        {/* Route & timing */}
        <div className="flex items-center gap-4 flex-1 justify-center">
          {/* Departure */}
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-800">
              {formatTime(schedule?.departureTime)}
            </p>
            <p className="text-xs text-slate-500">{schedule?.sourceAirport?.airportCode}</p>
          </div>

          {/* Duration line */}
          <div className="flex flex-col items-center flex-1 max-w-[140px]">
            <p className="text-xs text-slate-400 mb-1">{getDuration()}</p>
            <div className="w-full h-px bg-slate-300 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">Direct</p>
          </div>

          {/* Arrival */}
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-800">
              {formatTime(schedule?.arrivalTime)}
            </p>
            <p className="text-xs text-slate-500">{schedule?.destinationAirport?.airportCode}</p>
          </div>
        </div>

        {/* Price & book */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold text-slate-800">
              ₹{ticketCost?.toLocaleString('en-IN') || '—'}
            </p>
            <p className="text-xs text-slate-400">{availableSeats} seats left</p>
          </div>

          {showBook && onBook && (
            <button
              onClick={onBook}
              disabled={availableSeats <= 0}
              className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Book Now
            </button>
          )}
        </div>
      </div>

      {/* Date row */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-400">
        <span>{formatDate(schedule?.departureTime)}</span>
        <span>
          {schedule?.sourceAirport?.airportLocation} → {schedule?.destinationAirport?.airportLocation}
        </span>
      </div>
    </div>
  );
}
