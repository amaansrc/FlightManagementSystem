import client from './client';

/**
 * Schedule a new flight (admin only).
 */
export const scheduleFlight = (scheduledFlight) =>
  client.post('/scheduled-flights', scheduledFlight);

/**
 * Search scheduled flights by source, destination, and date.
 * @param {string} source - Airport code (e.g. "DEL")
 * @param {string} dest   - Airport code (e.g. "BOM")
 * @param {string} date   - ISO date string (e.g. "2026-08-01")
 */
export const searchFlights = (source, dest, date) =>
  client.get('/scheduled-flights/search', {
    params: { source, dest, date },
  });

/**
 * Get a scheduled flight by flight number.
 */
export const getScheduledFlight = (flightNumber) =>
  client.get(`/scheduled-flights/${flightNumber}`);

/**
 * Get all scheduled flights.
 */
export const getAllScheduledFlights = () =>
  client.get('/scheduled-flights');

/**
 * Modify a scheduled flight (admin only).
 */
export const modifyScheduledFlight = (scheduledFlight) =>
  client.put('/scheduled-flights', scheduledFlight);

/**
 * Delete a scheduled flight by ID (admin only).
 */
export const deleteScheduledFlight = (id) =>
  client.delete(`/scheduled-flights/${id}`);
