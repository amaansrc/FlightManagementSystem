import { useState, useEffect } from 'react';
import {
  scheduleFlight,
  getAllScheduledFlights,
  searchFlights,
  getScheduledFlight,
  modifyScheduledFlight,
  deleteScheduledFlight,
} from '../../api/scheduledFlights';
import { getAllFlights } from '../../api/flights';
import AirportSelect from '../../components/AirportSelect';

const TABS = ['Add', 'View All', 'Search', 'Update'];

/**
 * Scheduled flight management — tabbed CRUD for admins.
 * This is the most complex form because ScheduledFlight has nested Flight + Schedule objects.
 */
export default function ScheduledFlightManagementPage() {
  const [activeTab, setActiveTab] = useState('Add');

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Scheduled Flight Management</h1>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-lg p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-md text-sm font-medium cursor-pointer border-none transition-colors ${
              activeTab === tab
                ? 'bg-white text-primary shadow-sm'
                : 'bg-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Add' && <AddTab />}
      {activeTab === 'View All' && <ViewAllTab />}
      {activeTab === 'Search' && <SearchTab />}
      {activeTab === 'Update' && <UpdateTab />}
    </div>
  );
}

/* ─── Add Tab ─── */
function AddTab() {
  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(true);

  const [form, setForm] = useState({
    flightNumber: '',
    sourceAirport: '',
    destinationAirport: '',
    departureTime: '',
    arrivalTime: '',
    ticketCost: '',
    availableSeats: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const data = await getAllFlights();
        setFlights(data);
      } catch {
        setError('Failed to load flights.');
      } finally {
        setFlightsLoading(false);
      }
    };
    fetchFlights();
  }, []);

  // Auto-fill seat capacity when a flight is selected
  const handleFlightChange = (flightNumber) => {
    setForm((p) => ({ ...p, flightNumber }));
    const selected = flights.find((f) => String(f.flightNumber) === flightNumber);
    if (selected) {
      setForm((p) => ({ ...p, flightNumber, availableSeats: String(selected.seatCapacity) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.flightNumber || !form.sourceAirport || !form.destinationAirport ||
        !form.departureTime || !form.arrivalTime || !form.ticketCost || !form.availableSeats) {
      setError('All fields are required.');
      return;
    }
    if (form.sourceAirport === form.destinationAirport) {
      setError('Source and destination must be different.');
      return;
    }
    if (new Date(form.arrivalTime) <= new Date(form.departureTime)) {
      setError('Arrival time must be after departure time.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        flight: { flightNumber: parseInt(form.flightNumber) },
        schedule: {
          sourceAirport: { airportCode: form.sourceAirport },
          destinationAirport: { airportCode: form.destinationAirport },
          departureTime: form.departureTime,
          arrivalTime: form.arrivalTime,
        },
        availableSeats: parseInt(form.availableSeats),
        ticketCost: parseFloat(form.ticketCost),
      };
      const created = await scheduleFlight(payload);
      setSuccess(`Scheduled flight #${created.scheduledFlightId} created successfully.`);
      setForm({
        flightNumber: '', sourceAirport: '', destinationAirport: '',
        departureTime: '', arrivalTime: '', ticketCost: '', availableSeats: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to schedule flight.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Schedule a New Flight</h2>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Flight selection */}
        <div>
          <label htmlFor="flightSelect" className="block text-sm font-medium text-slate-700 mb-1">
            Flight
          </label>
          <select
            id="flightSelect"
            value={form.flightNumber}
            onChange={(e) => handleFlightChange(e.target.value)}
            disabled={flightsLoading}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          >
            <option value="">{flightsLoading ? 'Loading…' : 'Select a flight'}</option>
            {flights.map((f) => (
              <option key={f.flightNumber} value={f.flightNumber}>
                #{f.flightNumber} — {f.carrierName} ({f.flightModel})
              </option>
            ))}
          </select>
        </div>

        {/* Airports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AirportSelect
            label="Source Airport"
            id="sourceAirport"
            value={form.sourceAirport}
            onChange={(v) => setForm((p) => ({ ...p, sourceAirport: v }))}
            exclude={form.destinationAirport}
          />
          <AirportSelect
            label="Destination Airport"
            id="destinationAirport"
            value={form.destinationAirport}
            onChange={(v) => setForm((p) => ({ ...p, destinationAirport: v }))}
            exclude={form.sourceAirport}
          />
        </div>

        {/* Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="departureTime" className="block text-sm font-medium text-slate-700 mb-1">
              Departure Time
            </label>
            <input
              id="departureTime"
              type="datetime-local"
              value={form.departureTime}
              onChange={(e) => setForm((p) => ({ ...p, departureTime: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="arrivalTime" className="block text-sm font-medium text-slate-700 mb-1">
              Arrival Time
            </label>
            <input
              id="arrivalTime"
              type="datetime-local"
              value={form.arrivalTime}
              onChange={(e) => setForm((p) => ({ ...p, arrivalTime: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
            />
          </div>
        </div>

        {/* Cost & Seats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ticketCost" className="block text-sm font-medium text-slate-700 mb-1">
              Ticket Cost (₹)
            </label>
            <input
              id="ticketCost"
              type="number"
              value={form.ticketCost}
              onChange={(e) => setForm((p) => ({ ...p, ticketCost: e.target.value }))}
              placeholder="e.g. 4599"
              min="0"
              step="0.01"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="availableSeats" className="block text-sm font-medium text-slate-700 mb-1">
              Available Seats
            </label>
            <input
              id="availableSeats"
              type="number"
              value={form.availableSeats}
              onChange={(e) => setForm((p) => ({ ...p, availableSeats: e.target.value }))}
              placeholder="Auto-filled from flight"
              min="1"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {submitting ? 'Scheduling…' : 'Schedule Flight'}
        </button>
      </form>
    </div>
  );
}

/* ─── View All Tab ─── */
function ViewAllTab() {
  const [scheduledFlights, setScheduledFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAllScheduledFlights();
        setScheduledFlights(data);
      } catch (err) {
        setError(err.message || 'Failed to load scheduled flights.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm(`Delete scheduled flight #${id}?`)) return;
    try {
      await deleteScheduledFlight(id);
      setScheduledFlights((prev) =>
        prev.filter((sf) => String(sf.scheduledFlightId) !== String(id))
      );
    } catch (err) {
      setError(err.message || 'Failed to delete.');
    }
  };

  const formatDateTime = (dt) => {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  if (loading) return <p className="text-slate-500 text-center py-8">Loading…</p>;

  return (
    <div>
      {error && <Alert type="error" message={error} />}

      {scheduledFlights.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">No scheduled flights found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledFlights.map((sf) => (
            <div
              key={sf.scheduledFlightId}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs text-slate-400">ID: </span>
                  <span className="text-sm font-mono font-bold text-slate-800">
                    {sf.scheduledFlightId}
                  </span>
                  <span className="text-xs text-slate-400 ml-3">
                    Flight #{sf.flight?.flightNumber} · {sf.flight?.carrierName}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(sf.scheduledFlightId)}
                  className="text-xs text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"
                >
                  Delete
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium text-slate-800">
                  {sf.schedule?.sourceAirport?.airportCode || '—'}
                </span>
                <span className="text-slate-300">→</span>
                <span className="font-medium text-slate-800">
                  {sf.schedule?.destinationAirport?.airportCode || '—'}
                </span>
                <span className="text-xs text-slate-400 ml-auto">
                  {formatDateTime(sf.schedule?.departureTime)} – {formatDateTime(sf.schedule?.arrivalTime)}
                </span>
              </div>

              <div className="flex gap-4 mt-2 text-xs text-slate-500">
                <span>₹{sf.ticketCost?.toLocaleString('en-IN') || '—'}</span>
                <span>{sf.availableSeats} seats</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Search Tab ─── */
function SearchTab() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResults(null);

    if (!source || !destination || !date) {
      setError('All fields are required.');
      return;
    }

    setSearching(true);
    try {
      const data = await searchFlights(source, destination, date);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Search failed.');
    } finally {
      setSearching(false);
    }
  };

  const formatTime = (dt) => {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Search by Route & Date</h2>

      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <AirportSelect
          label="From"
          id="searchSource"
          value={source}
          onChange={setSource}
          exclude={destination}
        />
        <AirportSelect
          label="To"
          id="searchDest"
          value={destination}
          onChange={setDestination}
          exclude={source}
        />
        <div>
          <label htmlFor="searchDate" className="block text-sm font-medium text-slate-700 mb-1">
            Date
          </label>
          <input
            id="searchDate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={searching}
            className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>

      {results !== null && results.length === 0 && (
        <p className="text-slate-500 text-center py-6">No scheduled flights found.</p>
      )}

      {results && results.length > 0 && (
        <div className="space-y-3">
          {results.map((sf) => (
            <div key={sf.scheduledFlightId} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-slate-800">#{sf.scheduledFlightId}</span>
                <span className="text-slate-500">{sf.flight?.carrierName} · {sf.flight?.flightModel}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="font-medium">{sf.schedule?.sourceAirport?.airportCode}</span>
                <span className="text-slate-300">→</span>
                <span className="font-medium">{sf.schedule?.destinationAirport?.airportCode}</span>
                <span className="text-xs text-slate-400 ml-auto">
                  {formatTime(sf.schedule?.departureTime)} – {formatTime(sf.schedule?.arrivalTime)}
                </span>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-slate-500">
                <span>₹{sf.ticketCost?.toLocaleString('en-IN')}</span>
                <span>{sf.availableSeats} seats</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Update Tab ─── */
function UpdateTab() {
  const [scheduledFlightId, setScheduledFlightId] = useState('');
  const [form, setForm] = useState(null);
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingSF, setLoadingSF] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const data = await getAllFlights();
        setFlights(data);
      } catch { /* ignore */ }
    };
    fetchFlights();
  }, []);

  const handleLoad = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setForm(null);

    if (!scheduledFlightId.trim()) {
      setError('Enter a scheduled flight ID.');
      return;
    }

    setLoadingSF(true);
    try {
      const data = await getScheduledFlight(scheduledFlightId.trim());
      setForm({
        scheduledFlightId: data.scheduledFlightId,
        flightNumber: String(data.flight?.flightNumber || ''),
        sourceAirport: data.schedule?.sourceAirport?.airportCode || '',
        destinationAirport: data.schedule?.destinationAirport?.airportCode || '',
        departureTime: data.schedule?.departureTime?.slice(0, 16) || '',
        arrivalTime: data.schedule?.arrivalTime?.slice(0, 16) || '',
        ticketCost: String(data.ticketCost || ''),
        availableSeats: String(data.availableSeats || ''),
      });
    } catch (err) {
      setError(err.message || 'Scheduled flight not found.');
    } finally {
      setLoadingSF(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.sourceAirport === form.destinationAirport) {
      setError('Source and destination must be different.');
      return;
    }

    setSubmitting(true);
    try {
      await modifyScheduledFlight({
        scheduledFlightId: form.scheduledFlightId,
        flight: { flightNumber: parseInt(form.flightNumber) },
        schedule: {
          sourceAirport: { airportCode: form.sourceAirport },
          destinationAirport: { airportCode: form.destinationAirport },
          departureTime: form.departureTime,
          arrivalTime: form.arrivalTime,
        },
        availableSeats: parseInt(form.availableSeats),
        ticketCost: parseFloat(form.ticketCost),
      });
      setSuccess('Scheduled flight updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Update Scheduled Flight</h2>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Load by ID */}
      <form onSubmit={handleLoad} className="flex gap-3 mb-6">
        <input
          type="text"
          value={scheduledFlightId}
          onChange={(e) => setScheduledFlightId(e.target.value)}
          placeholder="Enter scheduled flight ID"
          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loadingSF}
          className="bg-slate-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {loadingSF ? 'Loading…' : 'Load'}
        </button>
      </form>

      {/* Edit form */}
      {form && (
        <form onSubmit={handleUpdate} className="space-y-4 border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-400">
            Editing scheduled flight <span className="font-mono font-bold">#{form.scheduledFlightId}</span>
          </p>

          {/* Flight selection */}
          <div>
            <label htmlFor="updateFlight" className="block text-sm font-medium text-slate-700 mb-1">
              Flight
            </label>
            <select
              id="updateFlight"
              value={form.flightNumber}
              onChange={(e) => setForm((p) => ({ ...p, flightNumber: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
            >
              <option value="">Select a flight</option>
              {flights.map((f) => (
                <option key={f.flightNumber} value={f.flightNumber}>
                  #{f.flightNumber} — {f.carrierName} ({f.flightModel})
                </option>
              ))}
            </select>
          </div>

          {/* Airports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AirportSelect
              label="Source Airport"
              id="updateSource"
              value={form.sourceAirport}
              onChange={(v) => setForm((p) => ({ ...p, sourceAirport: v }))}
              exclude={form.destinationAirport}
            />
            <AirportSelect
              label="Destination Airport"
              id="updateDest"
              value={form.destinationAirport}
              onChange={(v) => setForm((p) => ({ ...p, destinationAirport: v }))}
              exclude={form.sourceAirport}
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="updateDep" className="block text-sm font-medium text-slate-700 mb-1">
                Departure Time
              </label>
              <input
                id="updateDep"
                type="datetime-local"
                value={form.departureTime}
                onChange={(e) => setForm((p) => ({ ...p, departureTime: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="updateArr" className="block text-sm font-medium text-slate-700 mb-1">
                Arrival Time
              </label>
              <input
                id="updateArr"
                type="datetime-local"
                value={form.arrivalTime}
                onChange={(e) => setForm((p) => ({ ...p, arrivalTime: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
              />
            </div>
          </div>

          {/* Cost & Seats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="updateCost" className="block text-sm font-medium text-slate-700 mb-1">
                Ticket Cost (₹)
              </label>
              <input
                id="updateCost"
                type="number"
                value={form.ticketCost}
                onChange={(e) => setForm((p) => ({ ...p, ticketCost: e.target.value }))}
                min="0"
                step="0.01"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="updateSeats" className="block text-sm font-medium text-slate-700 mb-1">
                Available Seats
              </label>
              <input
                id="updateSeats"
                type="number"
                value={form.availableSeats}
                onChange={(e) => setForm((p) => ({ ...p, availableSeats: e.target.value }))}
                min="0"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? 'Updating…' : 'Update Scheduled Flight'}
          </button>
        </form>
      )}
    </div>
  );
}

/* ─── Shared helper ─── */
function Alert({ type, message }) {
  const styles =
    type === 'error'
      ? 'bg-red-50 border-red-200 text-red-600'
      : 'bg-green-50 border-green-200 text-green-600';
  return (
    <div className={`mb-4 p-3 border rounded-lg text-sm ${styles}`}>
      {message}
    </div>
  );
}
