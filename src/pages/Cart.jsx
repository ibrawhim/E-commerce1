import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../config/api.js";
import "./Cart.css";

export default function Cart() {
  const { items, removeFromCart, updateQty, subtotal, totalItems } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [coupon, setCoupon]             = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [backendItems, setBackendItems] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError]     = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      console.log("Local cart items:", items);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setFetchLoading(true);
    setFetchError("");

    api
      .get("/cart/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Backend cart response:", response.data);

        if (response.data?.success === false) {
          setFetchError(response.data?.message || "Failed to load cart.");
          return;
        }

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

        console.log("Mapped backend cart items:", mapped);
        setBackendItems(mapped);
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.msg     ||
          err.message                 ||
          "Could not load cart from server.";
        console.error("Fetch cart error:", err.response?.data || err.message);
        setFetchError(msg);
      })
      .finally(() => setFetchLoading(false));
  }, [isLoggedIn]);

  const displayItems = isLoggedIn && backendItems.length > 0 ? backendItems : items;

  const displaySubtotal = displayItems.reduce((s, item) => s + item.price * item.qty, 0);
  const displayCount    = displayItems.reduce((s, item) => s + item.qty, 0);

  const shipping      = displaySubtotal > 50 ? 0 : 9.99;
  const discount      = couponApplied ? displaySubtotal * 0.1 : 0;
  const tax           = (displaySubtotal - discount) * 0.075;
  const total         = displaySubtotal - discount + shipping + tax;

  function handleApplyCoupon() {
    if (coupon.trim().toLowerCase() === "save10") setCouponApplied(true);
  }

  if (fetchLoading) {
    return (
      <div className="cart-empty">
        <div className="cart-loading-dots">
          <span /><span /><span />
        </div>
        <p style={{ color: "#7A9A82", fontSize: "13px" }}>Loading your cart…</p>
      </div>
    );
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
        {fetchError && (
          <p className="cart-fetch-error">{fetchError}</p>
        )}
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
              {isLoggedIn && backendItems.length > 0 && (
                <span className="cart-header__source"> · synced from account</span>
              )}
            </p>
          </div>
          <Link to="/" className="cart-header__keep">← Keep Shopping</Link>
        </div>
      </div>

      {fetchError && (
        <div className="cart-fetch-error-bar">
          ⚠ {fetchError} — showing local cart instead.
        </div>
      )}

      <div className="cart-body">
        <div className="cart-items">
          <div className="cart-items__head">
            <span className="cart-col cart-col--product">Product</span>
            <span className="cart-col cart-col--price">Price</span>
            <span className="cart-col cart-col--qty">Quantity</span>
            <span className="cart-col cart-col--sub">Subtotal</span>
            <span className="cart-col cart-col--del" />
          </div>

          {displayItems.map((item) => {
            const lineTotal = (item.price * item.qty).toFixed(2);
            return (
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
                    {item.stock <= 5 && item.stock > 0 && (
                      <p className="cart-row__low-stock">Only {item.stock} left!</p>
                    )}
                  </div>
                </div>

                <div className="cart-col cart-col--price">
                  <span className="cart-row__price">${item.price.toFixed(2)}</span>
                </div>

                <div className="cart-col cart-col--qty">
                  <div className="cart-qty">
                    <button
                      className="cart-qty__btn"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      disabled={item.qty <= 1}
                    >−</button>
                    <span className="cart-qty__val">{item.qty}</span>
                    <button
                      className="cart-qty__btn"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      disabled={item.qty >= (item.stock || 999)}
                    >+</button>
                  </div>
                </div>

                <div className="cart-col cart-col--sub">
                  <span className="cart-row__sub">${lineTotal}</span>
                </div>

                <div className="cart-col cart-col--del">
                  <button
                    className="cart-row__remove"
                    onClick={() => {
                      if (isLoggedIn && backendItems.length > 0) {
                        setBackendItems((prev) => prev.filter((i) => i.id !== item.id));
                      } else {
                        removeFromCart(item.id);
                      }
                    }}
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
            );
          })}

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