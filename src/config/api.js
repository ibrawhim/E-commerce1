import axios from "axios";

export const BASE_URL = "https://enaijacommerce.onrender.com";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Endpoints that power the public landing page (product browsing) and
// should work whether or not the user is signed in. If a stored token has
// expired and one of these calls comes back unauthorized, we still clear
// the stale token so the UI reflects "logged out" — but we don't yank the
// person away from the page they're browsing. Any other endpoint (cart,
// orders, checkout, etc.) still redirects to /signin as before.
// TODO: confirm/adjust this list against the real endpoints Products.jsx calls.
const PUBLIC_ENDPOINTS = ["/products", "/categories"];

function isPublicEndpoint(url = "") {
  return PUBLIC_ENDPOINTS.some((path) => url.startsWith(path));
}

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

      // Some requests (e.g. the background cart sync on mount) are
      // best-effort and shouldn't yank the user off whatever page
      // they're on just because a stale token failed silently.
      const skipRedirect = error.config?.skipAuthRedirect;
      const requestUrl = error.config?.url || "";

      if (!skipRedirect && !isPublicEndpoint(requestUrl)) {
        window.location.href = "/signin";
      }
    }

    return Promise.reject(error);
  }
);