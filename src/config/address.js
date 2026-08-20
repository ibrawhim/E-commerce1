import { api } from "./api.js";

function getHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// GET /address — the user's one saved address, or null if they've never saved one
export async function getAddress() {
  const response = await api.get("/address", { headers: getHeaders() });
  const data = response.data;

  // If the backend wraps the address (e.g. { success: true, address: null }),
  // trust that field as-is — including when it's explicitly null — rather
  // than falling back to the wrapper object itself, which is truthy and
  // was being mistaken for a real saved address.
  if (data && typeof data === "object" && "address" in data) {
    return data.address ?? null;
  }

  return data ?? null;
}

// POST /address — create the user's first saved address
export async function createAddress(addressData) {
  const response = await api.post("/address", addressData, { headers: getHeaders() });
  return response.data;
}

// PATCH /address — update the existing saved address
export async function updateAddress(addressData) {
  const response = await api.patch("/address", addressData, { headers: getHeaders() });
  return response.data;
}