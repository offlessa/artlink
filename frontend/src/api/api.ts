import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  timeout: 30000,
});

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

    // Retry em erros de rede (sem resposta do servidor)
    const config = error.config;
    if (!error.response && config) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      if (config._retryCount <= 2) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);
