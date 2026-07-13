import client from './client';

/**
 * Add a new flight (admin only).
 */
export const addFlight = (flight) =>
  client.post('/flights', flight);

/**
 * Get a flight by its flight number.
 */
export const getFlight = (flightNumber) =>
  client.get(`/flights/${flightNumber}`);

/**
 * Get all flights.
 */
export const getAllFlights = () =>
  client.get('/flights');

/**
 * Modify a flight (admin only).
 */
export const modifyFlight = (flight) =>
  client.put('/flights', flight);

/**
 * Delete a flight by flight number (admin only).
 */
export const deleteFlight = (flightNumber) =>
  client.delete(`/flights/${flightNumber}`);
