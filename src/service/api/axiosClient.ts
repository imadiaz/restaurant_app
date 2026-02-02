import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  AppError,
  type ApiErrorResponse,
} from "../../data/models/api/api.types";
import { useAuthStore } from "../../store/auth.store";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 100000,
});

axiosClient.interceptors.request.use((config) => {
  const storage = localStorage.getItem("auth-storage");
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
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            console.log("Error", err);
            return Promise.reject(err);
          });
      }
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storage = localStorage.getItem("auth-storage");
        console.log("Getting storage", storage);
        const parsed = JSON.parse(storage || "{}");
        const userRefreshToken = parsed.state?.user?.refreshToken;
        if (!userRefreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          null,
          {
            headers: {
              Authorization: `Bearer ${userRefreshToken}`,
            },
          },
        );
        const { updateTokens } = useAuthStore.getState();
        const { accessToken, refreshToken } = response.data;
        updateTokens(accessToken, refreshToken);
        processQueue(null, accessToken);
        console.log("successfull refresh token");
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.log("Error efreshing token", refreshError);
        processQueue(refreshError, null);
        //  localStorage.removeItem('auth-storage');
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    let errorMessage = "Ocurrió un error inesperado";
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
      errorMessage = "No hay conexión con el servidor.";
      statusCode = 0;
    }

    return Promise.reject(
      new AppError(errorMessage, statusCode, errorCode, validationErrors),
    );
  },
);

export default axiosClient;
