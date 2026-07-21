import { api } from "../config/api.js";

function getHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// GET /orders — all orders for the logged-in user.
// The backend reads the user from the JWT, so no userId is ever sent.
export async function getOrders() {
  const response = await api.get("/orders", { headers: getHeaders() });
  return response.data;
}

// GET /orders/:orderId — a single order's full detail
export async function getOrderById(orderId) {
  const response = await api.get(`/orders/${orderId}`, { headers: getHeaders() });
  return response.data;
}

// PATCH /orders/:orderId/cancel — no request body needed, just the token
export async function cancelOrder(orderId) {
  const response = await api.patch(
    `/orders/${orderId}/cancel`,
    {},
    { headers: getHeaders() }
  );
  return response.data;
}