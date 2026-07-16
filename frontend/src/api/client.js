import axios from 'axios';

/**
 * Pre-configured Axios instance for all API calls.
 *
 * - baseURL points to the Spring Boot backend
 * - withCredentials ensures the JSESSIONID cookie is sent on every request
 */
const client = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor — attach JWT token if available.
 */
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor — unwrap the `data` property so callers
 * get the payload directly, and normalize error shapes.
 */
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Extract the backend error message if available
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    const status = error.response?.status;

    return Promise.reject({ message, status, raw: error });
  }
);

export default client;
