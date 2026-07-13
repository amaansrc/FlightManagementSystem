import client from './client';

/**
 * Register a new customer.
 * Backend force-sets userType to "CUSTOMER".
 */
export const register = (userData) =>
  client.post('/users/register', userData);

/**
 * Login with username and password.
 * Returns the User object; JSESSIONID cookie is set automatically.
 */
export const login = (userName, userPassword) =>
  client.post('/users/login', { userName, userPassword });

/**
 * Logout — invalidates the server-side session.
 */
export const logout = () =>
  client.post('/users/logout');

/**
 * Get a user by ID.
 */
export const getUser = (id) =>
  client.get(`/users/${id}`);

/**
 * Get all users (admin only).
 */
export const getAllUsers = () =>
  client.get('/users');

/**
 * Update user details.
 */
export const updateUser = (user) =>
  client.put('/users', user);

/**
 * Delete (deactivate) a user by ID (admin only).
 */
export const deleteUser = (id) =>
  client.delete(`/users/${id}`);
