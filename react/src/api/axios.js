import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_URL_DEV,
//   baseURL: import.meta.env.VITE_AXIOS_URL_SERVER,
  withCredentials: true,
  withXSRFToken: true,
  browserBaseURL: 'http://',
});

// Interceptor para actualizar los headers antes de cada solicitud
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('apiToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;


