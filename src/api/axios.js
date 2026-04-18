import axios from 'axios';
import { getToken, setToken, clearToken } from './tokenStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Required so the browser sends the HttpOnly refresh-token cookie cross-origin
  withCredentials: true,
});

// Attach the in-memory access token to every outgoing request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Queue for requests that arrive while a token refresh is already in progress
let isRefreshing = false;
let waitingQueue = [];

function flushQueue(error, token = null) {
  waitingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token),
  );
  waitingQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Don't retry the refresh endpoint itself — that would loop
    if (original.url === '/auth/refresh') {
      clearToken();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Hold this request until the in-flight refresh settles
      return new Promise((resolve, reject) => {
        waitingQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post('/auth/refresh');
      setToken(data.accessToken);
      flushQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (refreshError) {
      clearToken();
      flushQueue(refreshError, null);
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
