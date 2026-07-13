import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { addBooking } from '../../api/bookings';
import PassengerFormRow from '../../components/PassengerFormRow';
import FlightCard from '../../components/FlightCard';

const emptyPassenger = () => ({
  passengerName: '',
  passengerAge: '',
  passengerUIN: '',
  luggage: '',
});

/**
 * Booking form page — add passengers and submit a booking.
 * Receives the selected scheduledFlight via route state.
 */
export default function BookingFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const scheduledFlight = location.state?.scheduledFlight;

  const [passengers, setPassengers] = useState([emptyPassenger()]);
  const [passengerErrors, setPassengerErrors] = useState([{}]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If no flight was selected, show a message
  if (!scheduledFlight) {
    return (
      <div className="px-4 py-8 max-w-3xl mx-auto text-center">
        <p className="text-slate-500 text-lg">No flight selected.</p>
        <button
          onClick={() => navigate('/flights/search')}
          className="mt-4 bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark cursor-pointer"
        >
          Search Flights
        </button>
      </div>
    );
  }

  const maxPassengers = scheduledFlight.availableSeats || 1;

  const addPassenger = () => {
    if (passengers.length >= maxPassengers) return;
    setPassengers((prev) => [...prev, emptyPassenger()]);
    setPassengerErrors((prev) => [...prev, {}]);
  };

  const removePassenger = (index) => {
    setPassengers((prev) => prev.filter((_, i) => i !== index));
    setPassengerErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePassenger = (index, field, value) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
    // Clear error on edit
    if (passengerErrors[index]?.[field]) {
      setPassengerErrors((prev) =>
        prev.map((e, i) => (i === index ? { ...e, [field]: '' } : e))
      );
    }
  };

  const validate = () => {
    let valid = true;
    const errors = passengers.map((p) => {
      const e = {};
      if (!p.passengerName.trim()) {
        e.passengerName = 'Name is required.';
        valid = false;
      }
      if (!p.passengerAge || parseInt(p.passengerAge) <= 0) {
        e.passengerAge = 'Age must be greater than 0.';
        valid = false;
      }
      if (!p.passengerUIN || !/^\d{12}$/.test(p.passengerUIN)) {
        e.passengerUIN = 'UIN must be exactly 12 digits.';
        valid = false;
      }
      return e;
    });
    setPassengerErrors(errors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      const booking = {
        userId: { userId: user.userId },
        bookingDate: new Date().toISOString().split('T')[0],
        flight: { scheduledFlightId: scheduledFlight.scheduledFlightId },
        noOfPassengers: passengers.length,
        passengerList: passengers.map((p) => ({
          passengerName: p.passengerName.trim(),
          passengerAge: parseInt(p.passengerAge),
          passengerUIN: p.passengerUIN.trim(),
          luggage: parseFloat(p.luggage) || 0,
        })),
      };

      const created = await addBooking(booking);
      navigate(`/bookings/${created.bookingId}/confirmation`, {
        state: { booking: created },
      });
    } catch (err) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Booking Details</h1>

      {/* Flight summary */}
      <div className="mb-6">
        <FlightCard scheduledFlight={scheduledFlight} showBook={false} />
      </div>

      {/* Booking form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Passenger list */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Passengers ({passengers.length})
              </h2>
              <button
                type="button"
                onClick={addPassenger}
                disabled={passengers.length >= maxPassengers}
                className="text-sm text-primary hover:text-primary-dark bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add Passenger
              </button>
            </div>

            {passengers.map((p, i) => (
              <PassengerFormRow
                key={i}
                index={i}
                passenger={p}
                onChange={updatePassenger}
                onRemove={passengers.length > 1 ? removePassenger : null}
                errors={passengerErrors[i]}
              />
            ))}

            {passengers.length >= maxPassengers && (
              <p className="text-xs text-amber-600">
                Maximum {maxPassengers} passengers for this flight.
              </p>
            )}
          </div>

          {/* Cost summary */}
          <div className="border-t border-slate-200 pt-4 mb-6">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Ticket price per passenger</span>
              <span>₹{scheduledFlight.ticketCost?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 mt-1">
              <span>Number of passengers</span>
              <span>× {passengers.length}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-800 mt-2 pt-2 border-t border-slate-100">
              <span>Total</span>
              <span>₹{((scheduledFlight.ticketCost || 0) * passengers.length).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white py-3 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? 'Confirming booking…' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
