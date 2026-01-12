import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
});

// Interceptor para incluir el token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
