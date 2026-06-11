import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  timeout: 20000,
});

const MAX_RETRIES = 5;
const RETRY_DELAY = 10000;

function dispatch(retrying: boolean, attempt = 0) {
  window.dispatchEvent(new CustomEvent('api:coldstart', { detail: { retrying, attempt, max: MAX_RETRIES } }));
}

api.interceptors.response.use(
  (response) => {
    dispatch(false);
    return response;
  },
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
    const isNetworkError = !error.response;
    const isColdStart = [502, 503, 504].includes(error.response?.status);
    if ((isNetworkError || isColdStart) && config) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      if (config._retryCount <= MAX_RETRIES) {
        dispatch(true, config._retryCount);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return api(config);
      }
    }

    dispatch(false);
    return Promise.reject(error);
  }
);
