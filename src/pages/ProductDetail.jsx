import { useState, useEffect } from "react";
import axios from "axios";
import "./ProductDetail.css";
import { getTheme } from "./categoryThemes";
import { useCart } from "../context/CartContext";

function calcOriginalPrice(price, disc) {
  return (price / (1 - disc / 100)).toFixed(2);
}

function StarRating({ rating, count }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="pd-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`pd-star ${i <= full ? "full" : i === full + 1 && half ? "half" : ""}`}
        >
          ★
        </span>
      ))}
      <span className="pd-stars__num">{rating.toFixed(1)}</span>
      {count != null && <span className="pd-stars__count">({count} reviews)</span>}
    </div>
  );
}

function RelatedCard({ product, theme, onClick }) {
  const orig = calcOriginalPrice(product.price, product.discountPercentage);
  const hasDisc = product.discountPercentage > 0;
  return (
    <div
      className="pd-related-card"
      style={{ background: theme.cardBg, "--rc-accent": theme.accent }}
      onClick={() => onClick(product.id)}
    >
      <div className="pd-related-card__img-wrap">
        <img src={product.thumbnail} alt={product.title} loading="lazy" />
        {hasDisc && (
          <span className="pd-related-card__badge">
            −{Math.round(product.discountPercentage)}%
          </span>
        )}
      </div>
      <div className="pd-related-card__body">
        <p className="pd-related-card__brand" style={{ color: theme.subText }}>
          {product.brand || product.category}
        </p>
        <p className="pd-related-card__title" style={{ color: theme.text }}>
          {product.title}
        </p>
        <div className="pd-related-card__price-row">
          <span className="pd-related-card__price" style={{ color: theme.text }}>
            ${product.price.toFixed(2)}
          </span>
          {hasDisc && (
            <span className="pd-related-card__was" style={{ color: theme.subText }}>
              ${orig}
            </span>
          )}
        </div>
        <div className="pd-related-card__stars">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              style={{
                color: i <= Math.round(product.rating) ? theme.accent : theme.borderColor,
                fontSize: "11px",
              }}
            >
              ★
            </span>
          ))}
          <span style={{ fontSize: "11px", color: theme.subText, marginLeft: "4px" }}>
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review, theme }) {
  const initials = review.reviewerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const date = new Date(review.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return (
    <div className="pd-review" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
      <div className="pd-review__header">
        <div className="pd-review__avatar" style={{ background: theme.accent, color: "#fff" }}>
          {initials}
        </div>
        <div>
          <p className="pd-review__name" style={{ color: theme.text }}>
            {review.reviewerName}
          </p>
          <p className="pd-review__date" style={{ color: theme.subText }}>
            {date}
          </p>
        </div>
        <div className="pd-review__stars" style={{ marginLeft: "auto" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              style={{
                color: i <= review.rating ? theme.accent : theme.borderColor,
                fontSize: "13px",
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <p className="pd-review__comment" style={{ color: theme.subText }}>
        {review.comment}
      </p>
    </div>
  );
}

export default function ProductDetail({ productId, onBack, onProductSelect, initialBg }) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [visible, setVisible] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  function handleAddToCart() {
    addToCart(product, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(false);
    setProduct(null);
    setRelated([]);
    setActiveImg(0);
    setQty(1);
    setActiveTab("description");
    setVisible(false);

    axios
      .get(`https://dummyjson.com/products/${productId}`)
      .then((res) => {
        setProduct(res.data);
        return axios.get(
          `https://dummyjson.com/products/category/${res.data.category}?limit=8`
        );
      })
      .then((res) => {
        setRelated(res.data.products.filter((p) => p.id !== productId));
        setLoading(false);
        setTimeout(() => setVisible(true), 30);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [productId]);

  const loadingTheme = getTheme("all");
  const rootBg = loading || !product ? (initialBg || loadingTheme.bg) : getTheme(product.category).bg;

  if (loading) {
    return (
      <div className="pd-root pd-root--visible" style={{ background: rootBg }}>
        <div className="pd-loading">
          <div className="pd-loading__dots">
            <span style={{ background: loadingTheme.accent }} />
            <span style={{ background: loadingTheme.accent }} />
            <span style={{ background: loadingTheme.accent }} />
          </div>
          <p style={{ color: loadingTheme.subText }}>Loading product…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-root pd-root--visible" style={{ background: rootBg }}>
        <p className="pd-error">
          Failed to load product.{" "}
          <button onClick={onBack}>Go back</button>
        </p>
      </div>
    );
  }

  const theme = getTheme(product.category);
  const orig = calcOriginalPrice(product.price, product.discountPercentage);
  const hasDisc = product.discountPercentage > 0;
  const savings = (orig - product.price).toFixed(2);
  const images = product.images?.length ? product.images : [product.thumbnail];
  const avgRating = product.reviews?.length
    ? (
        product.reviews.reduce((s, r) => s + r.rating, 0) /
        product.reviews.length
      ).toFixed(1)
    : product.rating;

  const cssVars = {
    "--pd-accent": theme.accent,
    "--pd-accent-rgb": theme.accentRgb,
    "--pd-text": theme.text,
    "--pd-sub": theme.subText,
    "--pd-card": theme.cardBg,
    "--pd-border": theme.borderColor,
  };

  return (
    <div
      className={`pd-root ${visible ? "pd-root--visible" : ""}`}
      style={{ background: theme.bg, ...cssVars }}
    >
      <div
        className="pd-breadcrumb"
        style={{ borderBottomColor: theme.borderColor, background: theme.cardBg }}
      >
        <button
          className="pd-breadcrumb__btn"
          style={{ color: theme.subText }}
          onClick={onBack}
        >
          ← Back
        </button>
        <span className="pd-breadcrumb__sep" style={{ color: theme.borderColor }}>/</span>
        <span className="pd-breadcrumb__cat" style={{ color: theme.subText }}>
          {product.category}
        </span>
        <span className="pd-breadcrumb__sep" style={{ color: theme.borderColor }}>/</span>
        <span className="pd-breadcrumb__title" style={{ color: theme.accent }}>
          {product.title}
        </span>
      </div>

      <div className="pd-main">
        <div className="pd-gallery">
          <div
            className="pd-gallery__main"
            style={{ background: theme.cardBg, borderColor: theme.borderColor }}
          >
            <img
              src={images[activeImg]}
              alt={product.title}
              className="pd-gallery__img"
            />
            {hasDisc && (
              <div className="pd-gallery__badge" style={{ background: theme.accent }}>
                −{Math.round(product.discountPercentage)}% OFF
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="pd-gallery__thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`pd-gallery__thumb ${i === activeImg ? "active" : ""}`}
                  style={{
                    borderColor: i === activeImg ? theme.accent : theme.borderColor,
                    background: theme.cardBg,
                  }}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`View ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd-info">
          <p className="pd-info__brand" style={{ color: theme.subText }}>
            {product.brand}
          </p>
          <h1
            className="pd-info__title"
            style={{ color: theme.text, fontFamily: theme.fontFamily }}
          >
            {product.title}
          </h1>

          <StarRating rating={parseFloat(avgRating)} count={product.reviews?.length} />

          <div className="pd-info__price-block">
            <span className="pd-info__price" style={{ color: theme.text }}>
              ${product.price.toFixed(2)}
            </span>
            {hasDisc && (
              <>
                <span className="pd-info__was">${orig}</span>
                <span
                  className="pd-info__save"
                  style={{
                    background: `rgba(${theme.accentRgb},0.12)`,
                    color: theme.accent,
                  }}
                >
                  Save ${savings}
                </span>
              </>
            )}
          </div>

          <div className="pd-info__stock" style={{ borderColor: theme.borderColor }}>
            <span
              className="pd-info__stock-dot"
              style={{ background: product.stock > 0 ? "#4CAF50" : "#f44336" }}
            />
            <span
              style={{
                color: product.stock > 0 ? "#4CAF50" : "#f44336",
                fontSize: "13px",
              }}
            >
              {product.availabilityStatus}
            </span>
            {product.stock > 0 && (
              <span style={{ color: theme.subText, fontSize: "12px", marginLeft: "8px" }}>
                ({product.stock} units left)
              </span>
            )}
          </div>

          <p className="pd-info__desc" style={{ color: theme.subText }}>
            {product.description}
          </p>

          {product.tags?.length > 0 && (
            <div className="pd-info__tags">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="pd-info__tag"
                  style={{
                    background: `rgba(${theme.accentRgb},0.10)`,
                    color: theme.accent,
                    borderColor: `rgba(${theme.accentRgb},0.2)`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="pd-info__actions">
            <div
              className="pd-info__qty"
              style={{ borderColor: theme.borderColor, background: theme.cardBg }}
            >
              <button
                className="pd-info__qty-btn"
                style={{ color: theme.subText }}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="pd-info__qty-val" style={{ color: theme.text }}>
                {qty}
              </span>
              <button
                className="pd-info__qty-btn"
                style={{ color: theme.subText }}
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              >
                +
              </button>
            </div>
            <button
              className="pd-info__cart-btn"
              style={{ background: addedToCart ? "#6DDC8A" : theme.accent, color: "#fff", transition: "background 0.3s" }}
              onClick={handleAddToCart}
            >
              {addedToCart ? "✓ Added to Cart" : "Add to Cart"}
            </button>
            <button
              className="pd-info__buy-btn"
              style={{ borderColor: theme.accent, color: theme.accent }}
            >
              Buy Now
            </button>
          </div>

          {product.minimumOrderQuantity > 1 && (
            <p className="pd-info__moq" style={{ color: theme.subText }}>
              Minimum order quantity:{" "}
              <strong style={{ color: theme.accent }}>
                {product.minimumOrderQuantity}
              </strong>
            </p>
          )}

          <div className="pd-meta-grid" style={{ borderColor: theme.borderColor }}>
            {[
              { label: "SKU", value: product.sku },
              { label: "Brand", value: product.brand },
              { label: "Category", value: product.category },
              { label: "Weight", value: product.weight ? `${product.weight}g` : "—" },
              { label: "Warranty", value: product.warrantyInformation },
              { label: "Shipping", value: product.shippingInformation },
              { label: "Return Policy", value: product.returnPolicy },
              { label: "Barcode", value: product.meta?.barcode },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="pd-meta-grid__item"
                style={{ borderColor: theme.borderColor }}
              >
                <span className="pd-meta-grid__label" style={{ color: theme.subText }}>
                  {label}
                </span>
                <span className="pd-meta-grid__value" style={{ color: theme.text }}>
                  {value || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="pd-tabs"
        style={{ borderBottomColor: theme.borderColor, background: theme.cardBg }}
      >
        {["description", "specifications", "reviews"].map((tab) => (
          <button
            key={tab}
            className={`pd-tab ${activeTab === tab ? "active" : ""}`}
            style={{
              color: activeTab === tab ? theme.accent : theme.subText,
              borderBottomColor: activeTab === tab ? theme.accent : "transparent",
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "reviews" && product.reviews?.length
              ? ` (${product.reviews.length})`
              : ""}
          </button>
        ))}
      </div>

      <div className="pd-tab-content" style={{ background: theme.bg }}>
        {activeTab === "description" && (
          <div className="pd-tab-pane">
            <p className="pd-tab-pane__text" style={{ color: theme.subText }}>
              {product.description}
            </p>
            {product.tags?.length > 0 && (
              <p
                className="pd-tab-pane__text"
                style={{ color: theme.subText, marginTop: "1rem" }}
              >
                <strong style={{ color: theme.text }}>Tags: </strong>
                {product.tags.join(", ")}
              </p>
            )}
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="pd-tab-pane">
            <table
              className="pd-specs-table"
              style={{ color: theme.text, borderColor: theme.borderColor }}
            >
              <tbody>
                {[
                  ["SKU", product.sku],
                  ["Brand", product.brand],
                  ["Category", product.category],
                  ["Weight", product.weight ? `${product.weight}g` : "—"],
                  [
                    "Width",
                    product.dimensions?.width
                      ? `${product.dimensions.width} cm`
                      : "—",
                  ],
                  [
                    "Height",
                    product.dimensions?.height
                      ? `${product.dimensions.height} cm`
                      : "—",
                  ],
                  [
                    "Depth",
                    product.dimensions?.depth
                      ? `${product.dimensions.depth} cm`
                      : "—",
                  ],
                  ["Warranty", product.warrantyInformation],
                  ["Shipping", product.shippingInformation],
                  ["Return Policy", product.returnPolicy],
                  ["Min. Order Qty", product.minimumOrderQuantity],
                  ["Availability", product.availabilityStatus],
                  ["Stock", `${product.stock} units`],
                ].map(([label, value]) => (
                  <tr key={label} style={{ borderBottomColor: theme.borderColor }}>
                    <td
                      className="pd-specs-table__label"
                      style={{ color: theme.subText }}
                    >
                      {label}
                    </td>
                    <td
                      className="pd-specs-table__value"
                      style={{ color: theme.text }}
                    >
                      {value || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="pd-tab-pane">
            {product.reviews?.length ? (
              <>
                <div
                  className="pd-review-summary"
                  style={{ background: theme.cardBg, borderColor: theme.borderColor }}
                >
                  <div
                    className="pd-review-summary__score"
                    style={{ color: theme.accent }}
                  >
                    {avgRating}
                  </div>
                  <div>
                    <StarRating rating={parseFloat(avgRating)} />
                    <p
                      style={{
                        color: theme.subText,
                        fontSize: "12px",
                        margin: "4px 0 0",
                      }}
                    >
                      Based on {product.reviews.length} review
                      {product.reviews.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="pd-reviews-list">
                  {product.reviews.map((r, i) => (
                    <ReviewCard key={i} review={r} theme={theme} />
                  ))}
                </div>
              </>
            ) : (
              <p style={{ color: theme.subText }}>No reviews yet.</p>
            )}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div
          className="pd-related"
          style={{ background: theme.cardBg, borderTopColor: theme.borderColor }}
        >
          <div className="pd-related__header">
            <span className="pd-related__bar" style={{ background: theme.accent }} />
            <h2
              className="pd-related__title"
              style={{ color: theme.text, fontFamily: theme.fontFamily }}
            >
              Related Products
            </h2>
          </div>
          <div
            className="pd-related__grid"
            style={{ background: theme.borderColor }}
          >
            {related.slice(0, 6).map((p) => (
              <RelatedCard
                key={p.id}
                product={p}
                theme={theme}
                onClick={onProductSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}