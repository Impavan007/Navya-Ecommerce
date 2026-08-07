// axiosClient.ts
import axios from "axios";

// Create Axios instance
const axiosClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL
  // optional if your API uses cookies
});

// Request interceptor to automatically attach Bearer token
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
