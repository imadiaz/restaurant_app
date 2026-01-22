import axios from 'axios';

// Create a single instance to use throughout the app
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.your-backend.com', // Use env variable
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: Auto-attach token if it exists
axiosClient.interceptors.request.use((config) => {
  // We will read the token from localStorage (managed by Zustand persistence)
  // Or you can access the store directly here if needed.
  const storage = localStorage.getItem('auth-storage');
  if (storage) {
    const parsed = JSON.parse(storage);
    const token = parsed.state?.user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default axiosClient;