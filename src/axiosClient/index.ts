import { REFRESH_TOKEN } from "@/constants/endpoints";
import { authGetter, authSetter } from "@/store";
import axios, {
  AxiosError,
  isAxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

const axiosClient = axios.create({
  // baseURL: "http://localhost:4000/api",
  baseURL: "https://tide-focus.onrender.com/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  async (config) => {
    const token = authGetter();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

interface RetryQueueItem {
  config: AxiosRequestConfig;
  resolve: (value: AxiosResponse | PromiseLike<AxiosResponse>) => void;
  reject: (reason?: any) => void;
}

// Create a list to hold the request queue
const refreshAndRetryQueue: RetryQueueItem[] = [];

// Flag to prevent multiple token refresh requests
let isRefreshing = false;

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfig = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite retry loops

      if (!isRefreshing) {
        isRefreshing = true;
        // Cookies.remove("token");

        try {
          const newRefreshTokenResponse = await axiosClient.post(
            REFRESH_TOKEN,
            {},
            { withCredentials: true }
          );

          if (newRefreshTokenResponse?.data?.Data) {
            const newToken = (newRefreshTokenResponse.data as any).accessToken;

            // Update cookies
            authSetter(newToken);

            // Update default headers for future requests
            axiosClient.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newToken}`;

            // Update the original request header
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

            // Process all queued requests
            refreshAndRetryQueue.forEach(({ config, resolve, reject }) => {
              config.headers = config.headers || {};
              config.headers["Authorization"] = `Bearer ${newToken}`;

              axiosClient.request(config).then(resolve).catch(reject);
            });

            // Clear the queue
            refreshAndRetryQueue.length = 0;

            // Retry the original request
            return axiosClient(originalRequest);
          } else {
            // Refresh failed - reject all queued requests
            refreshAndRetryQueue.forEach(({ reject }) => {
              reject(new Error("Token refresh failed"));
            });
            refreshAndRetryQueue.length = 0;

            // Cleanup and redirect
            // Cookies.remove("token");
            // Cookies.remove("refreshToken");
            delete axiosClient.defaults.headers.common["Authorization"];
            window.location.href = "/";

            throw new Error(newRefreshTokenResponse?.data?.RespDescription);
          }
        } catch (err) {
          // Refresh failed - reject all queued requests
          refreshAndRetryQueue.forEach(({ reject }) => {
            reject(err);
          });
          refreshAndRetryQueue.length = 0;

          // Cleanup and redirect

          delete axiosClient.defaults.headers.common["Authorization"];
          window.location.href = "/";

          if (isAxiosError(err)) {
            throw new Error(
              err.response?.data?.RespDescription || "Token refresh failed"
            );
          }
          throw err;
        } finally {
          isRefreshing = false;
        }
      }

      // Add the original request to the queue
      return new Promise<AxiosResponse>((resolve, reject) => {
        refreshAndRetryQueue.push({
          config: originalRequest,
          resolve,
          reject,
        });
      });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
