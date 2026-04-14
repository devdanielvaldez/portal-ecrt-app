import axios from 'axios';

const API_BASE_URL = 'https://tgwvtprj-2876.use2.devtunnels.ms/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecrt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('ecrt_token');
      localStorage.removeItem('ecrt_user');
      localStorage.removeItem('ecrt_org');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
