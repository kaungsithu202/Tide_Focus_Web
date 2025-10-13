import { REFRESH_TOKEN } from "@/constants/endpoints";
import { authGetter, authSetter } from "@/store";
import axios, {
  isAxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

interface RetryQueueItem {
  config: AxiosRequestConfig;
  resolve: (value: AxiosResponse | PromiseLike<AxiosResponse>) => void;
  reject: (reason?: any) => void;
}

const axiosClient = axios.create({
  baseURL: "http://localhost:4000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshingR = false;

const requestQueue: Array<() => void> = [];

axiosClient.interceptors.request.use(async (config) => {
  const token = authGetter();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const refreshAndRetryQueue: RetryQueueItem[] = [];

// Flag to prevent multiple token refresh requests
let isRefreshing = false;

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfig = error.config;

    const token = authGetter();

    console.log("token response", token);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite retry loops
      console.log("trigger retry");

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshRes = await axiosClient.post(REFRESH_TOKEN); // cookie sent automatically
          const newToken = refreshRes.data.accessToken;
          console.log("newToken", newToken);
          authSetter(newToken);

          if (newToken) {
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

            delete axiosClient.defaults.headers.common["Authorization"];
            window.location.href = "/login";
          }
        } catch (err) {
          // Refresh failed - reject all queued requests
          refreshAndRetryQueue.forEach(({ reject }) => {
            reject(err);
          });
          refreshAndRetryQueue.length = 0;

          // Cleanup and redirect

          delete axiosClient.defaults.headers.common["Authorization"];
          window.location.href = "/login";

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
