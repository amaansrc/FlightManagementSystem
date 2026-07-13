import { useState, useEffect } from 'react';
import { getAllAirports } from '../api/airports';

/**
 * Reusable airport dropdown that fetches and caches the airport list.
 *
 * @param {string}   value       - Selected airport code
 * @param {Function} onChange    - (airportCode) => void
 * @param {string}   [label]     - Label text
 * @param {string}   [id]        - HTML id for the select
 * @param {string}   [placeholder] - Placeholder option text
 * @param {string}   [exclude]   - Airport code to exclude from the list
 */

// Module-level cache so we only fetch once across all instances
let airportCache = null;

export default function AirportSelect({
  value,
  onChange,
  label,
  id,
  placeholder = 'Select airport',
  exclude,
}) {
  const [airports, setAirports] = useState(airportCache || []);
  const [loading, setLoading] = useState(!airportCache);

  useEffect(() => {
    if (airportCache) return;

    const fetchAirports = async () => {
      try {
        const data = await getAllAirports();
        airportCache = data;
        setAirports(data);
      } catch {
        // Silently fail — dropdown will be empty
      } finally {
        setLoading(false);
      }
    };
    fetchAirports();
  }, []);

  const filtered = exclude
    ? airports.filter((a) => a.airportCode !== exclude)
    : airports;

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
      >
        <option value="">{loading ? 'Loading…' : placeholder}</option>
        {filtered.map((a) => (
          <option key={a.airportCode} value={a.airportCode}>
            {a.airportCode} — {a.airportName} ({a.airportLocation})
          </option>
        ))}
      </select>
    </div>
  );
}
