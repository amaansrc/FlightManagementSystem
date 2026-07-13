import { useState, useEffect } from 'react';
import {
  addFlight,
  getAllFlights,
  getFlight,
  modifyFlight,
  deleteFlight,
} from '../../api/flights';

const TABS = ['Add', 'View All', 'Search', 'Update'];

const emptyFlight = { flightModel: '', carrierName: '', seatCapacity: '' };

/**
 * Flight management page — tabbed interface for admin CRUD.
 * Tabs: Add | View All | Search | Update
 * Delete is surfaced as a button within View All / Search results.
 */
export default function FlightManagementPage() {
  const [activeTab, setActiveTab] = useState('Add');

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Flight Management</h1>

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

      {/* Tab content */}
      {activeTab === 'Add' && <AddTab />}
      {activeTab === 'View All' && <ViewAllTab />}
      {activeTab === 'Search' && <SearchTab />}
      {activeTab === 'Update' && <UpdateTab />}
    </div>
  );
}

/* ─── Add Tab ─── */
function AddTab() {
  const [form, setForm] = useState({ ...emptyFlight });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.flightModel.trim() || !form.carrierName.trim() || !form.seatCapacity) {
      setError('All fields are required.');
      return;
    }
    if (parseInt(form.seatCapacity) <= 0) {
      setError('Seat capacity must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await addFlight({
        flightModel: form.flightModel.trim(),
        carrierName: form.carrierName.trim(),
        seatCapacity: parseInt(form.seatCapacity),
      });
      setSuccess(`Flight #${created.flightNumber} added successfully.`);
      setForm({ ...emptyFlight });
    } catch (err) {
      setError(err.message || 'Failed to add flight.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Flight</h2>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Flight Model"
          id="flightModel"
          value={form.flightModel}
          onChange={(v) => setForm((p) => ({ ...p, flightModel: v }))}
          placeholder="e.g. Airbus A320"
        />
        <FormField
          label="Carrier Name"
          id="carrierName"
          value={form.carrierName}
          onChange={(v) => setForm((p) => ({ ...p, carrierName: v }))}
          placeholder="e.g. IndiGo"
        />
        <FormField
          label="Seat Capacity"
          id="seatCapacity"
          type="number"
          value={form.seatCapacity}
          onChange={(v) => setForm((p) => ({ ...p, seatCapacity: v }))}
          placeholder="e.g. 180"
          min="1"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {submitting ? 'Adding…' : 'Add Flight'}
        </button>
      </form>
    </div>
  );
}

/* ─── View All Tab ─── */
function ViewAllTab() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const data = await getAllFlights();
      setFlights(data);
    } catch (err) {
      setError(err.message || 'Failed to load flights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleDelete = async (flightNumber) => {
    if (!confirm(`Delete flight #${flightNumber}?`)) return;
    try {
      await deleteFlight(flightNumber);
      setFlights((prev) => prev.filter((f) => String(f.flightNumber) !== String(flightNumber)));
    } catch (err) {
      setError(err.message || 'Failed to delete flight.');
    }
  };

  if (loading) return <p className="text-slate-500 text-center py-8">Loading flights…</p>;

  return (
    <div>
      {error && <Alert type="error" message={error} />}

      {flights.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">No flights found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-600">#</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Model</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Carrier</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Seats</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((f) => (
                <tr key={f.flightNumber} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3 font-mono text-slate-800">{f.flightNumber}</td>
                  <td className="px-4 py-3 text-slate-800">{f.flightModel}</td>
                  <td className="px-4 py-3 text-slate-800">{f.carrierName}</td>
                  <td className="px-4 py-3 text-slate-800">{f.seatCapacity}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(f.flightNumber)}
                      className="text-xs text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Search Tab ─── */
function SearchTab() {
  const [flightNumber, setFlightNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!flightNumber.trim()) {
      setError('Please enter a flight number.');
      return;
    }

    setSearching(true);
    try {
      const data = await getFlight(flightNumber.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'Flight not found.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Search by Flight Number</h2>

      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value)}
          placeholder="Enter flight number"
          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
        />
        <button
          type="submit"
          disabled={searching}
          className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {searching ? 'Searching…' : 'Search'}
        </button>
      </form>

      {result && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-400">Flight Number</span>
              <p className="text-slate-800 font-medium font-mono">{result.flightNumber}</p>
            </div>
            <div>
              <span className="text-slate-400">Model</span>
              <p className="text-slate-800 font-medium">{result.flightModel}</p>
            </div>
            <div>
              <span className="text-slate-400">Carrier</span>
              <p className="text-slate-800 font-medium">{result.carrierName}</p>
            </div>
            <div>
              <span className="text-slate-400">Seat Capacity</span>
              <p className="text-slate-800 font-medium">{result.seatCapacity}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Update Tab ─── */
function UpdateTab() {
  const [flightNumber, setFlightNumber] = useState('');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingFlight, setLoadingFlight] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLoad = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setForm(null);

    if (!flightNumber.trim()) {
      setError('Enter a flight number to load.');
      return;
    }

    setLoadingFlight(true);
    try {
      const data = await getFlight(flightNumber.trim());
      setForm({
        flightNumber: data.flightNumber,
        flightModel: data.flightModel,
        carrierName: data.carrierName,
        seatCapacity: String(data.seatCapacity),
      });
    } catch (err) {
      setError(err.message || 'Flight not found.');
    } finally {
      setLoadingFlight(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.flightModel.trim() || !form.carrierName.trim() || !form.seatCapacity) {
      setError('All fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      await modifyFlight({
        flightNumber: form.flightNumber,
        flightModel: form.flightModel.trim(),
        carrierName: form.carrierName.trim(),
        seatCapacity: parseInt(form.seatCapacity),
      });
      setSuccess('Flight updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update flight.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Update Flight</h2>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Step 1: Load flight */}
      <form onSubmit={handleLoad} className="flex gap-3 mb-6">
        <input
          type="text"
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value)}
          placeholder="Enter flight number to load"
          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loadingFlight}
          className="bg-slate-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {loadingFlight ? 'Loading…' : 'Load'}
        </button>
      </form>

      {/* Step 2: Edit form */}
      {form && (
        <form onSubmit={handleUpdate} className="space-y-4 border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-400">
            Editing flight <span className="font-mono font-bold">#{form.flightNumber}</span>
          </p>
          <FormField
            label="Flight Model"
            id="updateFlightModel"
            value={form.flightModel}
            onChange={(v) => setForm((p) => ({ ...p, flightModel: v }))}
          />
          <FormField
            label="Carrier Name"
            id="updateCarrierName"
            value={form.carrierName}
            onChange={(v) => setForm((p) => ({ ...p, carrierName: v }))}
          />
          <FormField
            label="Seat Capacity"
            id="updateSeatCapacity"
            type="number"
            value={form.seatCapacity}
            onChange={(v) => setForm((p) => ({ ...p, seatCapacity: v }))}
            min="1"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? 'Updating…' : 'Update Flight'}
          </button>
        </form>
      )}
    </div>
  );
}

/* ─── Shared helpers ─── */

function FormField({ label, id, type = 'text', value, onChange, placeholder, min }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
      />
    </div>
  );
}

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
