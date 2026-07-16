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
import { format, parseISO } from 'date-fns';
import { DatePicker, DateTimePicker } from '../../components/ui/date-picker';

const TABS = ['Add', 'View All', 'Search', 'Update'];

/**
 * Scheduled flight management — tabbed CRUD for admins.
 * This is the most complex form because ScheduledFlight has nested Flight + Schedule objects.
 */
export default function ScheduledFlightManagementPage() {
  const [activeTab, setActiveTab] = useState('Add');

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Scheduled Flight Management</h1>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
              activeTab === tab
                ? 'bg-[#0059FF] text-white shadow-sm border-transparent'
                : 'bg-transparent text-white hover:bg-white/5 border-transparent'
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
    if (form.arrivalTime <= form.departureTime) {
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
          departureTime: format(form.departureTime, "yyyy-MM-dd'T'HH:mm"),
          arrivalTime: format(form.arrivalTime, "yyyy-MM-dd'T'HH:mm"),
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
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Schedule a New Flight</h2>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Flight selection */}
        <div>
          <label htmlFor="flightSelect" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
            Flight
          </label>
          <select
            id="flightSelect"
            value={form.flightNumber}
            onChange={(e) => handleFlightChange(e.target.value)}
            disabled={flightsLoading}
            className="glass-select w-full px-3 py-2.5 text-sm"
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
            <label htmlFor="departureTime" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
              Departure Time
            </label>
            <DateTimePicker
              date={form.departureTime}
              setDate={(d) => setForm((p) => ({ ...p, departureTime: d }))}
              placeholder="Select departure"
            />
          </div>
          <div>
            <label htmlFor="arrivalTime" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
              Arrival Time
            </label>
            <DateTimePicker
              date={form.arrivalTime}
              setDate={(d) => setForm((p) => ({ ...p, arrivalTime: d }))}
              placeholder="Select arrival"
            />
          </div>
        </div>

        {/* Cost & Seats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ticketCost" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
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
              className="glass-input w-full px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="availableSeats" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
              Available Seats
            </label>
            <input
              id="availableSeats"
              type="number"
              value={form.availableSeats}
              onChange={(e) => setForm((p) => ({ ...p, availableSeats: e.target.value }))}
              placeholder="Auto-filled from flight"
              min="1"
              className="glass-input w-full px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-accent px-6 py-2.5 text-sm"
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
        <div className="text-center py-12 glass-card">
          <p className="text-white">No scheduled flights found.</p>
        </div>
      ) : (() => {
        const totalPages = Math.ceil(scheduledFlights.length / itemsPerPage);
        const currentFlights = scheduledFlights.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        );
        return (
          <div className="space-y-3">
            {currentFlights.map((sf) => (
            <div
              key={sf.scheduledFlightId}
              className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs" style={{ color: '#94A3B8' }}>ID: </span>
                  <span className="text-sm font-mono font-bold text-white">
                    {sf.scheduledFlightId}
                  </span>
                  <span className="text-xs ml-3" style={{ color: '#94A3B8' }}>
                    Flight #{sf.flight?.flightNumber} · {sf.flight?.carrierName}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(sf.scheduledFlightId)}
                  className="text-xs text-red-400 hover:text-red-300 bg-transparent border-none cursor-pointer transition-colors"
                >
                  Delete
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium text-white">
                  {sf.schedule?.sourceAirport?.airportCode || '—'}
                </span>
                <span style={{ color: '#64748b' }}>→</span>
                <span className="font-medium text-white">
                  {sf.schedule?.destinationAirport?.airportCode || '—'}
                </span>
                <span className="text-xs ml-auto" style={{ color: '#94A3B8' }}>
                  {formatDateTime(sf.schedule?.departureTime)} – {formatDateTime(sf.schedule?.arrivalTime)}
                </span>
              </div>

              <div className="flex gap-4 mt-2 text-xs" style={{ color: '#94A3B8' }}>
                <span className="text-white">₹{sf.ticketCost?.toLocaleString('en-IN') || '—'}</span>
                <span>{sf.availableSeats} seats</span>
              </div>
            </div>
            ))}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 p-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm rounded-md transition-colors disabled:opacity-50 hover:bg-white/10"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                >
                  Previous
                </button>
                <span className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm rounded-md transition-colors disabled:opacity-50 hover:bg-white/10"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        );
      })()}
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
      const formattedDate = format(date, 'yyyy-MM-dd');
      const data = await searchFlights(source, destination, formattedDate);
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
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Search by Route & Date</h2>

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
          <label htmlFor="searchDate" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
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
            disabled={searching}
            className="btn-accent w-full py-2.5 text-sm"
          >
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>

      {results !== null && results.length === 0 && (
        <p className="text-center py-6" style={{ color: '#94A3B8' }}>No scheduled flights found.</p>
      )}

      {results && results.length > 0 && (
        <div className="space-y-3">
          {results.map((sf) => (
            <div key={sf.scheduledFlightId} className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-white">#{sf.scheduledFlightId}</span>
                <span style={{ color: '#94A3B8' }}>{sf.flight?.carrierName} · {sf.flight?.flightModel}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="font-medium text-white">{sf.schedule?.sourceAirport?.airportCode}</span>
                <span style={{ color: '#64748b' }}>→</span>
                <span className="font-medium text-white">{sf.schedule?.destinationAirport?.airportCode}</span>
                <span className="text-xs ml-auto" style={{ color: '#94A3B8' }}>
                  {formatTime(sf.schedule?.departureTime)} – {formatTime(sf.schedule?.arrivalTime)}
                </span>
              </div>
              <div className="flex gap-4 mt-2 text-xs" style={{ color: '#94A3B8' }}>
                <span className="text-white">₹{sf.ticketCost?.toLocaleString('en-IN')}</span>
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
        departureTime: data.schedule?.departureTime ? parseISO(data.schedule.departureTime) : undefined,
        arrivalTime: data.schedule?.arrivalTime ? parseISO(data.schedule.arrivalTime) : undefined,
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
          departureTime: format(form.departureTime, "yyyy-MM-dd'T'HH:mm"),
          arrivalTime: format(form.arrivalTime, "yyyy-MM-dd'T'HH:mm"),
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
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Update Scheduled Flight</h2>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Load by ID */}
      <form onSubmit={handleLoad} className="flex gap-3 mb-6">
        <input
          type="text"
          value={scheduledFlightId}
          onChange={(e) => setScheduledFlightId(e.target.value)}
          placeholder="Enter scheduled flight ID"
          className="glass-input flex-1 px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={loadingSF}
          className="glass-card px-6 py-2.5 text-sm font-medium text-white hover:bg-white/5 cursor-pointer"
        >
          {loadingSF ? 'Loading…' : 'Load'}
        </button>
      </form>

      {/* Edit form */}
      {form && (
        <form onSubmit={handleUpdate} className="space-y-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs" style={{ color: '#94A3B8' }}>
            Editing scheduled flight <span className="font-mono font-bold text-white">#{form.scheduledFlightId}</span>
          </p>

          {/* Flight selection */}
          <div>
            <label htmlFor="updateFlight" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
              Flight
            </label>
            <select
              id="updateFlight"
              value={form.flightNumber}
              onChange={(e) => setForm((p) => ({ ...p, flightNumber: e.target.value }))}
              className="glass-select w-full px-3 py-2.5 text-sm"
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
              <label htmlFor="updateDep" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
                Departure Time
              </label>
              <DateTimePicker
                date={form.departureTime}
                setDate={(d) => setForm((p) => ({ ...p, departureTime: d }))}
                placeholder="Select departure"
              />
            </div>
            <div>
              <label htmlFor="updateArr" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
                Arrival Time
              </label>
              <DateTimePicker
                date={form.arrivalTime}
                setDate={(d) => setForm((p) => ({ ...p, arrivalTime: d }))}
                placeholder="Select arrival"
              />
            </div>
          </div>

          {/* Cost & Seats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="updateCost" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
                Ticket Cost (₹)
              </label>
              <input
                id="updateCost"
                type="number"
                value={form.ticketCost}
                onChange={(e) => setForm((p) => ({ ...p, ticketCost: e.target.value }))}
                min="0"
                step="0.01"
                className="glass-input w-full px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="updateSeats" className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
                Available Seats
              </label>
              <input
                id="updateSeats"
                type="number"
                value={form.availableSeats}
                onChange={(e) => setForm((p) => ({ ...p, availableSeats: e.target.value }))}
                min="0"
                className="glass-input w-full px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-accent px-6 py-2.5 text-sm"
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
  const isError = type === 'error';
  return (
    <div
      className="mb-4 p-3 rounded-lg text-sm"
      style={{
        background: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
        color: isError ? '#fca5a5' : '#6ee7b7'
      }}
    >
      {message}
    </div>
  );
}
