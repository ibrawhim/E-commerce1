import { createContext, useState, useCallback, useEffect } from "react";
import { api } from "../config/api.js";

export const CartContext = createContext(null);

const GUEST_CART_STORAGE_KEY = "bcommerce-guest-cart";

function loadStoredItems() {
  try {
    const stored = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  // Guest cart — now initialized from localStorage so it survives a full
  // page reload, including the redirect out to Paystack and back during
  // checkout (which otherwise wiped it regardless of payment outcome).
  const [items, setItems]               = useState(loadStoredItems);
  const [backendItems, setBackendItems] = useState([]);
  const [cartSynced, setCartSynced]     = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full/unavailable — cart just won't survive a reload.
    }
  }, [items]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .get("/cart/", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        if (response.data?.success === false) return;
        const raw = response.data?.cart?.cartItems || [];
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
      .catch(() => {});
  }, []);

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
    setItems([]);
    setBackendItems([]);
    setCartSynced(false);
    try {
      localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  const totalItems = cartSynced ? backendItems.length : items.length;
  const subtotal   = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{
      items, setItems,
      backendItems, setBackendItems,
      cartSynced, setCartSynced,
      addToCart, removeFromCart, updateQty,
      syncBackendItem, updateBackendQty, removeBackendItem,
      clearCart,
      totalItems, subtotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}