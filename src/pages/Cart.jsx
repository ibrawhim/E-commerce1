import { useCart } from "../context/useCart";
import { useAuth } from "../context/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../config/api.js";
import "./Cart.css";

export default function Cart() {
  const {
    items, removeFromCart, updateQty, addToCart,
    backendItems, setBackendItems, updateBackendQty, removeBackendItem,
    cartSynced, clearCart,
  } = useCart();

  const { isLoggedIn } = useAuth();
  const navigate       = useNavigate();

  const [coupon, setCoupon]               = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const displayItems    = cartSynced && backendItems.length > 0 ? backendItems : items;
  const displaySubtotal = displayItems.reduce((s, i) => s + i.price * i.qty, 0);
  const displayCount    = displayItems.length;

  const shipping = displaySubtotal > 50 ? 0 : 9.99;
  const discount = couponApplied ? displaySubtotal * 0.1 : 0;
  const tax      = (displaySubtotal - discount) * 0.075;
  const total    = displaySubtotal - discount + shipping + tax;

  function getHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function handleQty(item, newQty) {
    if (newQty < 1) return;

    if (cartSynced) {
      updateBackendQty(item.id, newQty);
    } else {
      updateQty(item.id, newQty);
    }

    if (!isLoggedIn) return;

    const payload = { itemId: item.itemId, quantity: newQty };
    console.log("Updating qty — _id:", item.id, "itemId:", item.itemId, "payload:", payload);

    try {
      const response = await api.patch("/cart/update/", payload, { headers: getHeaders() });
      console.log("Update qty response:", response.data);
    } catch (err) {
      console.error("Update qty error:", err.response?.data || err.message);
      if (cartSynced) updateBackendQty(item.id, item.qty);
      else updateQty(item.id, item.qty);
    }
  }

  async function handleRemove(item) {
    if (!isLoggedIn) {
      removeFromCart(item.id);
      return;
    }

    if (cartSynced) {
      removeBackendItem(item.id);
    } else {
      removeFromCart(item.id);
    }

    console.log("Removing item — _id:", item.id, "itemId:", item.itemId);

    try {
      const response = await api.delete(`/cart/remove/${item.itemId}`, {
        headers: getHeaders(),
      });
      console.log("Remove item response:", response.data);
    } catch (err) {
      console.error("Remove item error:", err.response?.data || err.message);
      if (cartSynced) {
        setBackendItems((prev) => [...prev, item]);
      } else {
        addToCart(item, item.qty);
      }
    }
  }

  async function handleClearCart() {
    clearCart();

    if (!isLoggedIn) return;

    console.log("Clearing cart...");

    try {
      const response = await api.delete("/cart/clear/", { headers: getHeaders() });
      console.log("Clear cart response:", response.data);
    } catch (err) {
      console.error("Clear cart error:", err.response?.data || err.message);
    }
  }

  function handleApplyCoupon() {
    if (coupon.trim().toLowerCase() === "save10") setCouponApplied(true);
  }

  if (displayItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <h2 className="cart-empty__title">Your cart is empty</h2>
        <p className="cart-empty__sub">Looks like you haven't added anything yet.</p>
        <Link to="/" className="cart-empty__btn">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-root">
      <div className="cart-header">
        <div className="cart-header__inner">
          <div>
            <h1 className="cart-header__title">My Cart</h1>
            <p className="cart-header__count">
              {displayCount} item{displayCount !== 1 ? "s" : ""}
              {cartSynced && (
                <span className="cart-header__source"> · synced from account</span>
              )}
            </p>
          </div>
          <Link to="/" className="cart-header__keep">← Keep Shopping</Link>
        </div>
      </div>

      <div className="cart-body">
        <div className="cart-items">
          <div className="cart-items__head">
            <span className="cart-col cart-col--product">Product</span>
            <span className="cart-col cart-col--price">Price</span>
            <span className="cart-col cart-col--qty">Quantity</span>
            <span className="cart-col cart-col--sub">Subtotal</span>
            <span className="cart-col cart-col--del" />
          </div>

          {displayItems.map((item) => (
            <div key={item.id} className="cart-row">
              <div className="cart-col cart-col--product">
                <img
                  src={item.thumbnail || item.image}
                  alt={item.title}
                  className="cart-row__img"
                  onClick={() => navigate("/")}
                />
                <div className="cart-row__info">
                  <p className="cart-row__brand">{item.brand || item.category}</p>
                  <p className="cart-row__title">{item.title}</p>
                  <p className="cart-row__sku">SKU: {item.sku || item.itemId || "N/A"}</p>
                </div>
              </div>

              <div className="cart-col cart-col--price">
                <span className="cart-row__price">${item.price.toFixed(2)}</span>
              </div>

              <div className="cart-col cart-col--qty">
                <div className="cart-qty">
                  <button
                    className="cart-qty__btn"
                    onClick={() => handleQty(item, item.qty - 1)}
                    disabled={item.qty <= 1}
                  >
                    −
                  </button>
                  <span className="cart-qty__val">{item.qty}</span>
                  <button
                    className="cart-qty__btn"
                    onClick={() => handleQty(item, item.qty + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cart-col cart-col--sub">
                <span className="cart-row__sub">
                  ${(item.price * item.qty).toFixed(2)}
                </span>
              </div>

              <div className="cart-col cart-col--del">
                <button
                  className="cart-row__remove"
                  onClick={() => handleRemove(item)}
                  aria-label="Remove item"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}

          <div className="cart-items__footer">
            <span className="cart-items__subtotal-label">Order Subtotal</span>
            <span className="cart-items__subtotal-val">${displaySubtotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="cart-summary">
          <h2 className="cart-summary__title">Order Summary</h2>

          <div className="cart-summary__rows">
            <div className="cart-summary__row">
              <span>Subtotal</span>
              <span>${displaySubtotal.toFixed(2)}</span>
            </div>
            {couponApplied && (
              <div className="cart-summary__row cart-summary__row--discount">
                <span>Discount (10%)</span>
                <span>−${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="cart-summary__row">
              <span>Shipping</span>
              <span>
                {shipping === 0
                  ? <span className="cart-summary__free">Free</span>
                  : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="cart-summary__row">
              <span>Sales Tax (7.5%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          </div>

          {shipping > 0 && (
            <p className="cart-summary__free-msg">
              Add ${(50 - displaySubtotal).toFixed(2)} more for free shipping
            </p>
          )}

          <div className="cart-summary__total">
            <span>Estimated Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="cart-coupon">
            <label className="cart-coupon__label">Coupon Code</label>
            <div className="cart-coupon__row">
              <input
                type="text"
                className="cart-coupon__input"
                placeholder='Try "SAVE10"'
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                disabled={couponApplied}
              />
              <button
                className="cart-coupon__btn"
                onClick={handleApplyCoupon}
                disabled={couponApplied || !coupon.trim()}
              >
                {couponApplied ? "Applied ✓" : "Apply"}
              </button>
            </div>
          </div>

          <button
            className="cart-summary__checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout →
          </button>

          <button
            className="cart-summary__clear-btn"
            onClick={handleClearCart}
          >
            Clear Cart
          </button>

          <div className="cart-summary__trust">
            <span>🔒 Secure Checkout</span>
            <span>·</span>
            <span>Free Returns</span>
            <span>·</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}