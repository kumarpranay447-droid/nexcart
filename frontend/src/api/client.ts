import axios from 'axios';

/**
 * Shared Axios instance. All requests go through the Vite dev proxy
 * (/api -> Spring Cloud Gateway on :8080), so the app never hard-codes
 * service URLs.
 *
 * - Request interceptor attaches the JWT from localStorage.
 * - Response interceptor logs the user out on 401 (expired/invalid token).
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexcart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexcart_token');
      localStorage.removeItem('nexcart_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
