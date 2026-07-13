import client from './client';

/**
 * Get all airports (fixed seed data — cache-friendly).
 */
export const getAllAirports = () =>
  client.get('/airports');

/**
 * Get a single airport by its code.
 */
export const getAirport = (code) =>
  client.get(`/airports/${code}`);
