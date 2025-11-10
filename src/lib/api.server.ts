import axios, { AxiosInstance } from "axios";

// Axios instance for server-side route handlers to call backend API directly
export function createServerApi(baseURL = process.env.NEXT_PUBLIC_API_BASE_URL): AxiosInstance {
  const instance = axios.create({
    baseURL,
    // Trust backend self-signed if needed via env in node runtime
    // validateStatus: () => true,
  });
  return instance;
}

export const serverApi = createServerApi();
