import { api } from "./api.js";

function getHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// The shared `api` instance sets Content-Type: application/json as a
// default header at creation time (see config/api.js). That default is
// present on EVERY request unless explicitly overridden — and since the
// browser only auto-generates the correct multipart/form-data boundary
// when no Content-Type header is already set, that default silently
// broke FormData uploads (including the images). Setting it to
// `undefined` here removes it for this specific request so the browser
// can set the correct multipart boundary itself.
function getFormDataHeaders() {
  return {
    ...getHeaders(),
    "Content-Type": undefined,
  };
}

// POST /seller/products — create a new product.
// `formData` must be a FormData instance built by the caller (see
// buildProductFormData in SellerProductForm.jsx).
export async function createSellerProduct(formData) {
  const response = await api.post("/seller/products", formData, {
    headers: getFormDataHeaders(),
  });
  return response.data;
}

// GET /seller/products — all of the logged-in seller's products
export async function getSellerProducts() {
  const response = await api.get("/seller/products", { headers: getHeaders() });
  return response.data;
}

// GET /seller/products/:productId — a single product owned by the seller
export async function getSellerProduct(productId) {
  const response = await api.get(`/seller/products/${productId}`, { headers: getHeaders() });
  return response.data;
}

// PATCH /seller/products/:productId — update a product. `payload` can be
// a FormData (if new images are being uploaded) or a plain object (if
// only text/number fields changed) — only the FormData case needs the
// Content-Type override.
export async function updateSellerProduct(productId, payload) {
  const isFormData = payload instanceof FormData;
  const response = await api.patch(`/seller/products/${productId}`, payload, {
    headers: isFormData ? getFormDataHeaders() : getHeaders(),
  });
  return response.data;
}

// DELETE /seller/products/:productId
export async function deleteSellerProduct(productId) {
  const response = await api.delete(`/seller/products/${productId}`, { headers: getHeaders() });
  return response.data;
}