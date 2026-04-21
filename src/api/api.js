import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Global error interceptor — logs all API errors to console for easy debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      `API Error [${error.config?.method?.toUpperCase()} ${error.config?.url}]:`,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default api;
