import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getAllAirports } from '../../api/airports';
import { searchFlights } from '../../api/scheduledFlights';
import FlightCard from '../../components/FlightCard';
import BorderGlowCard from '../../components/ui/BorderGlowCard';
import { format } from 'date-fns';
import { DatePicker } from '../../components/ui/date-picker';
import { Plane, Globe, Clock, ShieldCheck } from 'lucide-react';

/**
 * Landing page — NovaPay dark glassmorphic design.
 * Hero section, stat cards with glow, flight search widget, results.
 */
export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Airport data
  const [airports, setAirports] = useState([]);
  const [airportsLoading, setAirportsLoading] = useState(true);

  // Search form state
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  // Search results
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
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/bookings/new' } } });
    } else {
      navigate('/bookings/new', { state: { scheduledFlight } });
    }
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

  const stats = [
    { icon: Plane, value: '500+', label: 'FLIGHTS DAILY', delay: '0.1s' },
    { icon: Globe, value: '50+', label: 'DESTINATIONS', delay: '0.2s' },
    { icon: Clock, value: '99.9%', label: 'ON-TIME RATE', delay: '0.3s' },
    { icon: ShieldCheck, value: '0', label: 'HIDDEN FEES', delay: '0.4s' },
  ];

  return (
    <div className="pb-16">
      {/* ═══ Hero Section ═══ */}
      <section className="relative px-4 pt-12 pb-20 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Eyebrow */}
          <p
            className="text-xs font-medium tracking-[0.25em] mb-6 animate-float-up"
            style={{ color: '#3B82F6', animationDelay: '0.1s' }}
          >
            SEAMLESS FLIGHTS. SMART BOOKING. TOTAL CONTROL.
          </p>

          {/* Hero heading */}
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-tight tracking-tight mb-6 animate-float-up"
            style={{ animationDelay: '0.2s' }}
          >
            Book Domestic Flights
            <br />
            <span className="font-semibold" style={{ color: '#3B82F6' }}>
              Effortlessly
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-12 animate-float-up"
            style={{ color: '#94A3B8', animationDelay: '0.3s' }}
          >
            Search and book flights across India's top destinations with transparent pricing and no surprises.
          </p>
        </div>
      </section>

      {/* ═══ Stat Cards ═══ */}
      <section className="px-4 -mt-8 mb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <BorderGlowCard key={stat.label} animated>
              <div className="p-6 text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: '#3B82F6' }} />
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs font-medium tracking-wider" style={{ color: '#94A3B8' }}>
                  {stat.label}
                </p>
              </div>
            </BorderGlowCard>
          ))}
        </div>
      </section>

      {/* ═══ Search Widget ═══ */}
      <section className="px-4 mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-white text-center mb-8">
            Find Your Flight
          </h2>

          <div className="glass-card p-6 md:p-8">
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
              {/* Source */}
              <div>
                <label htmlFor="source" className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                  From
                </label>
                <select
                  id="source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  disabled={airportsLoading}
                  className="glass-select w-full px-4 py-3 text-sm"
                >
                  <option value="">Select origin</option>
                  {airports.map((a) => (
                    <option key={a.airportCode} value={a.airportCode}>
                      {a.airportCode} — {a.airportLocation}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div>
                <label htmlFor="destination" className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                  To
                </label>
                <select
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  disabled={airportsLoading}
                  className="glass-select w-full px-4 py-3 text-sm"
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
                <label htmlFor="date" className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                  Date
                </label>
                <DatePicker
                  date={date}
                  setDate={setDate}
                  placeholder="Select travel date"
                />
              </div>

              {/* Search button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={searching || airportsLoading}
                  className="btn-accent w-full py-3 text-sm"
                >
                  {searching ? 'Searching…' : 'Search Flights'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ═══ Results ═══ */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto">
          {results !== null && results.length === 0 && (
            <div className="text-center py-16 glass-card">
              <p className="text-lg text-white mb-1">No flights found for this route and date.</p>
              <p className="text-sm" style={{ color: '#94A3B8' }}>Try a different date or route.</p>
            </div>
          )}

          {sortedResults && sortedResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                  {sortedResults.length} flight{sortedResults.length > 1 ? 's' : ''} found
                </p>
                <div className="flex items-center space-x-2">
                  <label htmlFor="sortLanding" className="text-sm font-medium" style={{ color: '#94A3B8' }}>Sort by:</label>
                  <select
                    id="sortLanding"
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
      </section>
    </div>
  );
}
