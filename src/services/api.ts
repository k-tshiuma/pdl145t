import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import type { ApiError } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

/**
 * Instance Axios configurée avec intercepteurs JWT.
 * - Ajoute automatiquement le Bearer token
 * - Renouvelle le token si expiré (via refresh)
 * - Redirige vers /login si refresh échoue
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor : injecter le JWT ───────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor : gestion token expiré ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    // Token expiré — tenter un refresh
    if (
      error.response?.status === 401 &&
      error.response?.data?.error?.code === 'AUTHENTICATION_ERROR' &&
      originalRequest &&
      !(originalRequest as any)._retry
    ) {
      (originalRequest as any)._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        useAuthStore.getState().setAccessToken(data.data.accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        }
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export { api };
export default api;
