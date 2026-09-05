import { useState, useCallback, useEffect, useRef } from "react";
import { CartContext } from "./CartContextInstance";
import { api } from "../config/api.js";

const GUEST_CART_KEY = "bcommerce-guest-cart";

function loadStoredItems() {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function fetchCart(setBackendItems, setCartSynced, setCartLoading, requestIdRef) {
  const token = localStorage.getItem("token");
  if (!token) {
    setCartLoading(false);
    return;
  }

  setCartLoading(true);
  // Tag this request so a clearCart() that happens while it's in flight
  // can invalidate it — otherwise a slow response can resolve *after*
  // the cart was cleared and silently overwrite the empty state with
  // stale pre-clear items.
  const requestId = ++requestIdRef.current;

  api
    .get("/cart/", { headers: { Authorization: `Bearer ${token}` } })
    .then((response) => {
      if (requestIdRef.current !== requestId) return; // stale — dropped
      if (response.data?.success === false) return;
      const raw    = response.data?.cart?.cartItems || [];
      const mapped = raw.map((item) => ({
        id:          item._id,
        itemId:      item.itemId,
        title:       item.title,
        description: item.description,
        category:    item.category,
        brand:       item.brand,
        weight:      item.weight,
        price:       item.price,
        thumbnail:   item.image,
        qty:         item.quantity,
        sku:         item.itemId,
        stock:       999,
      }));
      setBackendItems(mapped);
      setCartSynced(true);
    })
    .catch(() => {})
    .finally(() => {
      if (requestIdRef.current === requestId) setCartLoading(false);
    });
}

export function CartProvider({ children }) {
  const [items, setItems]               = useState(loadStoredItems);
  const [backendItems, setBackendItems] = useState([]);
  const [cartSynced, setCartSynced]     = useState(false);
  const [cartLoading, setCartLoading]   = useState(!!localStorage.getItem("token"));

  // Tracks the most recent cart-fetch "generation". Bumped by clearCart()
  // so any fetch that was already in flight when the cart got cleared is
  // recognized as stale and ignored when it eventually resolves.
  const requestIdRef = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    fetchCart(setBackendItems, setCartSynced, setCartLoading, requestIdRef);
  }, []);

  function refetchCart() {
    fetchCart(setBackendItems, setCartSynced, setCartLoading, requestIdRef);
  }

  function addToCart(product, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { ...product, qty }];
    });
  }

  const syncBackendItem = useCallback((product, qty = 1) => {
    setBackendItems((prev) => {
      const existing = prev.find((i) => i.itemId === String(product.id));
      if (existing) {
        return prev.map((i) =>
          i.itemId === String(product.id) ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          id:          String(product.id),
          itemId:      String(product.id),
          title:       product.title,
          description: product.description || "",
          category:    product.category    || "",
          brand:       product.brand       || product.category || "",
          weight:      product.weight      || 0,
          price:       product.price,
          thumbnail:   product.thumbnail   || "",
          qty,
          sku:         String(product.id),
          stock:       product.stock       || 999,
        },
      ];
    });
    setCartSynced(true);
  }, []);

  function removeFromCart(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQty(id, qty) {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  }

  function updateBackendQty(id, newQty) {
    if (newQty < 1) return;
    setBackendItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: newQty } : i)));
  }

  function removeBackendItem(id) {
    setBackendItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      if (next.length === 0) setCartSynced(false);
      return next;
    });
  }

  function clearCart() {
    // Invalidate any cart fetch that's currently in flight — its result,
    // if it lands after this, belongs to the pre-clear cart and must not
    // be allowed to overwrite what we're about to set here.
    requestIdRef.current++;
    setItems([]);
    setBackendItems([]);
    setCartSynced(false);
    try { localStorage.removeItem(GUEST_CART_KEY); } catch {}
  }

  const totalItems = cartSynced ? backendItems.length : items.length;
  const subtotal   = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{
      items, setItems,
      backendItems, setBackendItems,
      cartSynced, setCartSynced,
      cartLoading,
      refetchCart,
      addToCart, removeFromCart, updateQty,
      syncBackendItem, updateBackendQty, removeBackendItem,
      clearCart,
      totalItems, subtotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}