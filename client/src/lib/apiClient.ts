import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const apiClient = axios.create({
  baseURL,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let waitQueue: Array<{
  resolve: () => void;
  reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown) {
  waitQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  waitQueue = [];
}

let onAuthFailure: (() => void) | null = null;

export function setAuthFailureHandler(handler: (() => void) | null) {
  onAuthFailure = handler;
}

const SKIP_REFRESH_URLS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const requestUrl = original?.url ?? '';
    const isAuthEndpoint = SKIP_REFRESH_URLS.some((u) => requestUrl.includes(u));

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      if (isRefreshing) {
        await new Promise<void>((resolve, reject) => {
          waitQueue.push({ resolve, reject });
        });
        return apiClient(original);
      }

      isRefreshing = true;
      try {
        await apiClient.post('/auth/refresh');
        flushQueue(null);
        return apiClient(original);
      } catch (refreshErr) {
        flushQueue(refreshErr);
        if (onAuthFailure) onAuthFailure();
        return Promise.reject(toReadableError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(toReadableError(error));
  }
);

function toReadableError(error: unknown): Error {
  if (error instanceof AxiosError) {
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      'Unknown error';
    return new Error(message);
  }
  if (error instanceof Error) return error;
  return new Error('Unknown error');
}
