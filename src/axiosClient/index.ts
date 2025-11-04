import { REFRESH_TOKEN } from "@/constants/endpoints";
import { authGetter, authSetter } from "@/store";
import axios, { type AxiosRequestConfig } from "axios";

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

type RetryQueueItem = {
  resolve: (token: string) => void;
  reject: (error: any) => void;
};

let refreshAndRetryQueue: RetryQueueItem[] = [];

let isRefreshing = false;

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

function subscribeTokenRefresh(
  resolve: (token: string) => void,
  reject: (error: any) => void
) {
  refreshAndRetryQueue.push({ resolve, reject });
}

function onRefreshed(token: string) {
  refreshAndRetryQueue.forEach((item) => item.resolve(token));
  refreshAndRetryQueue = [];
}

function onRefreshFailed(error: any) {
  refreshAndRetryQueue.forEach((item) => item.reject(error));
  refreshAndRetryQueue = [];
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (err) => {
    const { config, response } = err;
    const originalRequest: AxiosRequestConfig = config;
    if (response && response.status === 401 && !originalRequest._retry) {
      console.log("trigger if", isRefreshing);
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await axiosClient.post(REFRESH_TOKEN);

          console.log("refreshRes", refreshRes);
          const access_token = refreshRes.data.accessToken;
          authSetter(access_token);
          axiosClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${access_token}`;
          isRefreshing = false;
          onRefreshed(access_token);
          await Promise.all(
            refreshAndRetryQueue.map(({ resolve }) => resolve(access_token))
          );
          return axios(originalRequest);
        } catch (err) {
          console.log("❌ Refresh token failed:", err);
          isRefreshing = false;
          onRefreshFailed(err);
          authSetter(null);
          console.log("➡ Redirecting to login");
          window.location.href = "/login";
          return Promise.reject(err);
        } finally {
          refreshAndRetryQueue = [];
        }
      }
      originalRequest._retry = true;
      // return new Promise((resolve, reject) => {
      //   subscribeTokenRefresh(
      //     (token: string) => {
      //       console.log("subscribeTokenRefresh resolve", token);
      //       if (!originalRequest.headers) originalRequest.headers = {};
      //       originalRequest.headers["Authorization"] = `Bearer ${token}`;
      //       resolve(axios(originalRequest));
      //     },
      //     (error) => {
      //       console.log("subscribeTokenRefresh error", error);
      //       reject(error);
      //     }
      //   );
      // });
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
