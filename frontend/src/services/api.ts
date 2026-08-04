import axios from "axios";
import { store } from "../store/index.ts";
import { setCredentials, logout } from "../store/slices/authSlice.ts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for cookie transmission
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach access token if present
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 token refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops and handle only 401 unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we are already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Hit refresh token endpoint
        const response = await axios.post(
          `${API_URL}/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;

        // Dispatch new credentials
        const currentUser = store.getState().auth.user;
        if (currentUser) {
          store.dispatch(
            setCredentials({ accessToken, user: currentUser })
          );
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Refresh failed, logout the user
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
