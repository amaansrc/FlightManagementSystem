import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllAirports } from '../../api/airports';
import { searchFlights } from '../../api/scheduledFlights';
import FlightCard from '../../components/FlightCard';
import { format } from 'date-fns';
import { DatePicker } from '../../components/ui/date-picker';

/**
 * Search flights page — customer search with results.
 * Similar to the landing page widget but within the authenticated area.
 */
export default function SearchFlightsPage() {
  const navigate = useNavigate();

  const [airports, setAirports] = useState([]);
  const [airportsLoading, setAirportsLoading] = useState(true);

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [sortBy, setSortBy] = useState('');

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
      const formattedDate = format(date, 'yyyy-MM-dd');
      const data = await searchFlights(source, destination, formattedDate);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleBook = (scheduledFlight) => {
    navigate('/bookings/new', { state: { scheduledFlight } });
  };

  const sortedResults = results ? [...results].sort((a, b) => {
    if (sortBy === 'PRICE_ASC') {
      return a.ticketCost - b.ticketCost;
    }
    if (sortBy === 'PRICE_DESC') {
      return b.ticketCost - a.ticketCost;
    }
    if (sortBy === 'DURATION_ASC' || sortBy === 'DURATION_DESC') {
      const durationA = new Date(a.schedule.arrivalTime) - new Date(a.schedule.departureTime);
      const durationB = new Date(b.schedule.arrivalTime) - new Date(b.schedule.departureTime);
      return sortBy === 'DURATION_ASC' ? durationA - durationB : durationB - durationA;
    }
    return 0;
  }) : null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Search Flights</h1>

      {/* Search form */}
      <div className="glass-card p-6 mb-8">
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

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="source" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
              From
            </label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              disabled={airportsLoading}
              className="glass-select w-full px-3 py-2.5 text-sm"
            >
              <option value="">Select origin</option>
              {airports.map((a) => (
                <option key={a.airportCode} value={a.airportCode}>
                  {a.airportCode} — {a.airportLocation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="destination" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
              To
            </label>
            <select
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={airportsLoading}
              className="glass-select w-full px-3 py-2.5 text-sm"
            >
              <option value="">Select destination</option>
              {airports.map((a) => (
                <option key={a.airportCode} value={a.airportCode}>
                  {a.airportCode} — {a.airportLocation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
              Date
            </label>
            <DatePicker
              date={date}
              setDate={setDate}
              placeholder="Select travel date"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={searching || airportsLoading}
              className="btn-accent w-full py-2.5 text-sm"
            >
              {searching ? 'Searching…' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {results !== null && results.length === 0 && (
        <div className="text-center py-12 glass-card">
          <p className="text-lg text-white">No flights found for this route and date.</p>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Try a different date or route.</p>
        </div>
      )}

      {sortedResults && sortedResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {sortedResults.length} flight{sortedResults.length > 1 ? 's' : ''} found
            </p>
            <div className="flex items-center space-x-2">
              <label htmlFor="sort" className="text-sm font-medium" style={{ color: '#94A3B8' }}>Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glass-select px-3 py-1.5 text-sm rounded-md"
              >
                <option value="">None</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
                <option value="DURATION_ASC">Duration: Short to Long</option>
                <option value="DURATION_DESC">Duration: Long to Short</option>
              </select>
            </div>
          </div>
          {sortedResults.map((sf) => (
            <FlightCard
              key={sf.scheduledFlightId}
              scheduledFlight={sf}
              onBook={() => handleBook(sf)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
