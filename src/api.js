import axios from 'axios';

const API = axios.create({
    baseURL: 'https://connectsphere-backend-cssq.onrender.com/api',
  timeout: 10000,
});

// Attach token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log("✅ Token attached to request:", token); // Debug log
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
