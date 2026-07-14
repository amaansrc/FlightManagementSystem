/**
 * Single passenger input row — reusable form section.
 *
 * @param {number}   index       - Passenger index (0-based)
 * @param {Object}   passenger   - { passengerName, passengerAge, passengerUIN, luggage }
 * @param {Function} onChange    - (index, field, value) => void
 * @param {Function} onRemove    - (index) => void — null if not removable
 * @param {Object}   errors      - field-level errors for this passenger
 */
export default function PassengerFormRow({ index, passenger, onChange, onRemove, errors = {} }) {
  return (
    <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">
          Passenger {index + 1}
        </h3>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-xs text-red-400 hover:text-red-300 bg-transparent border-none cursor-pointer transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>
            Full Name
          </label>
          <input
            type="text"
            value={passenger.passengerName}
            onChange={(e) => onChange(index, 'passengerName', e.target.value)}
            placeholder="Enter full name"
            className="glass-input w-full px-3 py-2 text-sm"
          />
          {errors.passengerName && (
            <p className="text-xs text-red-400 mt-1">{errors.passengerName}</p>
          )}
        </div>

        {/* Age */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>
            Age
          </label>
          <input
            type="number"
            value={passenger.passengerAge}
            onChange={(e) => onChange(index, 'passengerAge', e.target.value)}
            placeholder="Age"
            min="1"
            className="glass-input w-full px-3 py-2 text-sm"
          />
          {errors.passengerAge && (
            <p className="text-xs text-red-400 mt-1">{errors.passengerAge}</p>
          )}
        </div>

        {/* UIN (Aadhaar-style 12 digits) */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>
            UIN (12-digit ID)
          </label>
          <input
            type="text"
            value={passenger.passengerUIN}
            onChange={(e) => onChange(index, 'passengerUIN', e.target.value)}
            placeholder="123456789012"
            maxLength={12}
            className="glass-input w-full px-3 py-2 text-sm"
          />
          {errors.passengerUIN && (
            <p className="text-xs text-red-400 mt-1">{errors.passengerUIN}</p>
          )}
        </div>

        {/* Luggage */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>
            Luggage (kg)
          </label>
          <input
            type="number"
            value={passenger.luggage}
            onChange={(e) => onChange(index, 'luggage', e.target.value)}
            placeholder="0"
            min="0"
            step="0.5"
            className="glass-input w-full px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
