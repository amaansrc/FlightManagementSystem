import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getAllAirports } from '../../api/airports';
import { searchFlights } from '../../api/scheduledFlights';
import FlightCard from '../../components/FlightCard';

/**
 * Landing page — public entry point.
 * Displays a flight search widget and results.
 */
export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Airport data (fetched once)
  const [airports, setAirports] = useState([]);
  const [airportsLoading, setAirportsLoading] = useState(true);

  // Search form state
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  // Search results
  const [results, setResults] = useState(null); // null = not searched yet, [] = no results
  const [searching, setSearching] = useState(false);

  // Fetch airports on mount
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const data = await getAllAirports();
        setAirports(data);
      } catch {
        setError('Failed to load airports.');
      } finally {
        setAirportsLoading(false);
      }
    };
    fetchAirports();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResults(null);

    if (!source || !destination || !date) {
      setError('Please select source, destination, and date.');
      return;
    }
    if (source === destination) {
      setError('Source and destination must be different.');
      return;
    }

    setSearching(true);
    try {
      const data = await searchFlights(source, destination, date);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleBook = (scheduledFlight) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/bookings/new' } } });
    } else {
      navigate('/bookings/new', { state: { scheduledFlight } });
    }
  };

  // Today's date for the date picker minimum
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="px-4 py-8">
      {/* Hero section */}
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          ✈ Book Domestic Flights
        </h1>
        <p className="text-slate-500">
          Search and book flights across India's top destinations.
        </p>
      </div>

      {/* Search widget */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 p-6 mb-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Source airport */}
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-slate-700 mb-1">
              From
            </label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              disabled={airportsLoading}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
            >
              <option value="">Select origin</option>
              {airports.map((a) => (
                <option key={a.airportCode} value={a.airportCode}>
                  {a.airportCode} — {a.airportLocation}
                </option>
              ))}
            </select>
          </div>

          {/* Destination airport */}
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-slate-700 mb-1">
              To
            </label>
            <select
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={airportsLoading}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
            >
              <option value="">Select destination</option>
              {airports.map((a) => (
                <option key={a.airportCode} value={a.airportCode}>
                  {a.airportCode} — {a.airportLocation}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
            />
          </div>

          {/* Search button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={searching || airportsLoading}
              className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {searching ? 'Searching…' : 'Search Flights'}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto">
        {results !== null && results.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500 text-lg">No flights found for this route and date.</p>
            <p className="text-slate-400 text-sm mt-1">Try a different date or route.</p>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 mb-2">
              {results.length} flight{results.length > 1 ? 's' : ''} found
            </p>
            {results.map((sf) => (
              <FlightCard
                key={sf.scheduledFlightId}
                scheduledFlight={sf}
                onBook={() => handleBook(sf)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
