import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

const MAX_RETRIES = 2;
const RETRY_DELAY = 5000;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@artlink:token');
      localStorage.removeItem('@artlink:usuario');
      sessionStorage.removeItem('@artlink:token');
      sessionStorage.removeItem('@artlink:usuario');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Servidor dormindo (Render free tier cold start) — tenta novamente
    const config = error.config;
    if (!error.response && config) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      if (config._retryCount <= MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);
