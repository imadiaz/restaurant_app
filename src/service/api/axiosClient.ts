import axios, { AxiosError } from 'axios';
import { AppError, type ApiErrorResponse } from '../../data/models/api/api.types';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 100000,
});

axiosClient.interceptors.request.use((config) => {
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

axiosClient.interceptors.response.use(
  (response) => response.data,

  (error: AxiosError<ApiErrorResponse>) => {
    let errorMessage = 'Ocurrió un error inesperado';
    let statusCode = 500;
    let errorCode: string | undefined = undefined;
    let validationErrors: string[] = [];

    if (error.response) {
      const serverData = error.response.data;
      
      statusCode = serverData.statusCode || error.response.status;
      errorCode = serverData.errorCode; 

      if (Array.isArray(serverData.message)) {
        errorMessage = serverData.message[0];
        validationErrors = serverData.message;
      } else {
        errorMessage = serverData.message || error.message;
      }
    } else if (error.request) {
      errorMessage = 'No hay conexión con el servidor.';
      statusCode = 0;
    }
    return Promise.reject(
      new AppError(errorMessage, statusCode, errorCode, validationErrors)
    );
  }
);

export default axiosClient;