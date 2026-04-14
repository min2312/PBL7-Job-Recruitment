import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';

import { refreshSession } from './authService';

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosRetry(axiosClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    const status = error?.response?.status;
    const requestConfig = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) &&
      status !== 401 &&
      status !== 403 &&
      !requestConfig?._retry
    );
  },
});

const isAuthEndpoint = (url?: string) => {
  if (!url) {
    return false;
  }

  return [
    '/api/login',
    '/api/admin_login',
    '/api/logout',
    '/api/logoutAdmin',
    '/api/refresh-token',
    '/api/admin/refresh-token',
  ].some((endpoint) => url.includes(endpoint));
};

const shouldUseAdminRefresh = (url?: string) => {
  if (!url) {
    return false;
  }

  return url.includes('/api/admin') || url.includes('/api/accountAdmin');
};

let isRefreshing = false;

type RefreshSubscriber = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  request: RetryAxiosRequestConfig;
};

let refreshSubscribers: RefreshSubscriber[] = [];

const notifySubscribers = () => {
  refreshSubscribers.forEach(({ resolve, request }) => {
    resolve(axiosClient(request));
  });
  refreshSubscribers = [];
};

const rejectSubscribers = (reason: unknown) => {
  refreshSubscribers.forEach(({ reject }) => reject(reason));
  refreshSubscribers = [];
};

const enqueueSubscriber = (subscriber: RefreshSubscriber) => {
  refreshSubscribers.push(subscriber);
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryAxiosRequestConfig;
    const response = error.response;

    if (!response || !originalRequest) {
      return Promise.reject(error);
    }

    if (isAuthEndpoint(originalRequest.url) || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (response.status !== 401) {
      return Promise.reject(error);
    }

    const scope = shouldUseAdminRefresh(originalRequest.url) ? 'admin' : 'user';
    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        enqueueSubscriber({ resolve, reject, request: originalRequest });
      });
    }

    isRefreshing = true;

    try {
      const refreshed = await refreshSession(scope);
      if (!refreshed) {
        rejectSubscribers(error);
        return Promise.reject(error);
      }

      notifySubscribers();
      return axiosClient(originalRequest);
    } catch (refreshError) {
      rejectSubscribers(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;