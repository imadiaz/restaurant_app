import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  AppError,
  type ApiErrorResponse,
} from "../../data/models/api/api.types";
import { useAuthStore } from "../../store/auth.store";
import { isAccessTokenExpired } from "../../config/auth.config";

/* ------------------------------------------------------------------ */
/* Refresh queue logic                                                  */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Centralized refresh function                                         */
/* ------------------------------------------------------------------ */
const refreshTokens = async (): Promise<string> => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    const response = await axios.post<any, any>(
      `${import.meta.env.VITE_API_URL}/auth/refresh`,
      null,
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      response?.data?.data;
    useAuthStore.getState().updateTokens(newAccessToken, newRefreshToken);
    processQueue(null, newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.log("Error refreshing token before", error);
    processQueue(error, null);
    useAuthStore.getState().logout();
    throw error;
  } finally {
    isRefreshing = false;
  }
};

/* ------------------------------------------------------------------ */
/* Axios instance                                                       */
/* ------------------------------------------------------------------ */

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 100000,
});

/* ------------------------------------------------------------------ */
/* Request interceptor (proactive refresh)                              */
/* ------------------------------------------------------------------ */

axiosClient.interceptors.request.use(async (config) => {
  const { accessToken, refreshToken } = useAuthStore.getState();

  if (!accessToken || !refreshToken) {
    return config;
  }

  if (isAccessTokenExpired()) {
    const newAccessToken = await refreshTokens();
    config.headers.Authorization = `Bearer ${newAccessToken}`;
    return config;
  }

  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
}, Promise.reject);

/* ------------------------------------------------------------------ */
/* Response interceptor (fallback safety)                               */
/* ------------------------------------------------------------------ */

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshTokens();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch {
        console.log("Error in catch");
        // logout already handled in refreshTokens
        return Promise.reject(error);
      }
    }

    /* ---------------- Custom error mapping ---------------- */

    let errorMessage = "Ocurrió un error inesperado";
    let statusCode = 500;
    let errorCode: string | undefined;
    let validationErrors: string[] = [];

    if (error.response) {
      const serverData = error.response.data as ApiErrorResponse;

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
