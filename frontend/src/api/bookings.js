import client from './client';

/**
 * Create a new booking.
 * ticketCost is computed server-side — don't send it.
 */
export const addBooking = (booking) =>
  client.post('/bookings', booking);

/**
 * Get a booking by ID.
 * ⚠️ Backend returns a list-wrapped single object — unwrap here.
 */
export const getBooking = async (bookingId) => {
  const data = await client.get(`/bookings/${bookingId}`);
  // Backend quirk: returns Booking[] even for single-ID lookup
  return Array.isArray(data) ? data[0] : data;
};

/**
 * Get all bookings.
 */
export const getAllBookings = () =>
  client.get('/bookings');

/**
 * Modify a booking.
 */
export const modifyBooking = (booking) =>
  client.put('/bookings', booking);

/**
 * Cancel a booking by ID (soft-delete, restores seats).
 */
export const deleteBooking = (bookingId) =>
  client.delete(`/bookings/${bookingId}`);
