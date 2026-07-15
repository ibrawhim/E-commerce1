import axios from "axios";

export const BASE_URL = "https://enaijacommerce.onrender.com";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.msg     ||
      "";

    const hadToken = !!localStorage.getItem("token");

    const isExpired =
      hadToken && (
        status === 401 ||
        message.toLowerCase().includes("expired") ||
        message.toLowerCase().includes("jwt") ||
        message.toLowerCase().includes("invalid token")
      );

    if (isExpired) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("bcommerce-user");
      window.location.href = "/signin";
    }

    return Promise.reject(error);
  }
);