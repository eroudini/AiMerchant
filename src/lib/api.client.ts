"use client";
import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "@/lib/auth-store";

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (error: unknown) => void; config: any }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      if (token && p.config?.headers) {
        p.config.headers["Authorization"] = `Bearer ${token}`;
      }
      p.resolve(null);
    }
  });
  failedQueue = [];
}

export function createClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: "/api",
  });

  instance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const originalRequest: any = error.config;
      if (error.response?.status === 401 && !originalRequest?._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest });
          })
            .then(() => {
              const token = useAuthStore.getState().accessToken;
              if (token && originalRequest?.headers) {
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
              }
              return instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;
        try {
          const refreshRes = await axios.post("/api/auth/refresh");
          const newToken = (refreshRes?.data as any)?.accessToken as string | undefined;
          useAuthStore.getState().setToken(newToken ?? null);
          processQueue(null, newToken ?? null);
          if (newToken && originalRequest?.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          }
          return instance(originalRequest);
        } catch (err) {
          processQueue(err, null);
          useAuthStore.getState().logout();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

// Default singleton client
export const apiClient = createClient();
