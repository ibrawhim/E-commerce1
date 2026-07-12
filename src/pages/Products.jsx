import { useState, useEffect } from "react";
import axios from "axios";
import "./Products.css";
import CategoryHero from "./CategoryHero";
import ProductDetail from "./ProductDetail";
import { getTheme } from "./categoryThemes";
import { useCart } from "../context/useCart";
import { useTheme } from "../context/useTheme";
import { useAuth } from "../context/useAuth";
import { api } from "../config/api.js";

const DARK = {
  bg:          "#0C1410",
  card:        "#111F16",
  surface:     "#152019",
  border:      "#1E3828",
  borderLight: "#1A3022",
  text:        "#E8F5EE",
  sub:         "#7AC49A",
  muted:       "#4A7A5A",
};

function StarRating({ rating }) {
  return (
    <div className="product-card__stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`product-card__star ${i <= Math.round(rating) ? "filled" : ""}`}>★</span>
      ))}
      <span className="product-card__rating-num">{rating.toFixed(1)}</span>
    </div>
  );
}

function GridIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="0"   y="0"   width="6.5" height="6.5" rx="1" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" />
      <rect x="9.5" y="0"   width="6.5" height="6.5" rx="1" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" />
      <rect x="0"   y="9.5" width="6.5" height="6.5" rx="1" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" />
      <rect x="9.5" y="9.5" width="6.5" height="6.5" rx="1" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ListIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="0" y="0"  width="4" height="4" rx="0.8" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" />
      <line x1="7" y1="2"  x2="16" y2="2"  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="0" y="6"  width="4" height="4" rx="0.8" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" />
      <line x1="7" y1="8"  x2="16" y2="8"  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="0" y="12" width="4" height="4" rx="0.8" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" />
      <line x1="7" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ProductCard({ product, theme, onClick, viewMode, isDark }) {
  const { addToCart, syncBackendItem } = useCart();
  const { user, isLoggedIn }           = useAuth();
  const [added, setAdded]              = useState(false);

  const originalPrice = (product.price / (1 - product.discountPercentage / 100)).toFixed(2);
  const hasDiscount   = product.discountPercentage > 0;
  const savings       = (originalPrice - product.price).toFixed(2);

  const cardBg     = isDark ? DARK.card    : theme.cardBg;
  const cardBorder = isDark ? DARK.border  : theme.borderColor;
  const cardText   = isDark ? DARK.text    : theme.text;
  const cardSub    = isDark ? DARK.sub     : theme.subText;
  const imgBg      = isDark ? DARK.surface : theme.cardBg;

  async function handleAdd(e) {
    e.stopPropagation();
    addToCart(product, 1);

    if (isLoggedIn && user?._id) {
      const token   = localStorage.getItem("token");
      const payload = {
        userId: user._id,
        cartItems: [{
          itemId:      String(product.id),
          description: product.description || "",
          category:    product.category    || "",
          brand:       product.brand       || product.category || "",
          weight:      product.weight      || 0,
          title:       product.title,
          price:       product.price,
          image:       product.thumbnail   || "",
          quantity:    1,
        }],
      };
      console.log("Adding to cart — payload sent to backend:", payload);
      try {
        const response = await api.post("/cart/addtocart", payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        console.log("Add to cart response:", response.data);
        if (response.data?.success !== false) {
          syncBackendItem(product, 1);
        }
      } catch (err) {
        console.error("Add to cart error:", err.response?.data || err.message);
      }
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  const cssVars = {
    "--card-bg":     cardBg,
    "--card-border": cardBorder,
    "--card-accent": theme.accent,
    "--card-text":   cardText,
    "--card-sub":    cardSub,
  };

  if (viewMode === "list") {
    return (
      <div
        className="product-list-card"
        style={{ ...cssVars, background: cardBg, borderBottomColor: cardBorder }}
        onClick={() => onClick(product.id)}
      >
        <div className="product-list-card__img-wrap" style={{ background: imgBg }}>
          <img src={product.thumbnail} alt={product.title} loading="lazy" />
          {hasDiscount && (
            <span className="product-list-card__badge">−{Math.round(product.discountPercentage)}%</span>
          )}
        </div>

        <div className="product-list-card__body" style={{ borderRightColor: cardBorder, background: cardBg }}>
          <div className="product-list-card__top">
            <span className="product-list-card__brand" style={{ color: cardSub }}>{product.brand || product.category}</span>
            <span className="product-list-card__stock">{product.availabilityStatus || "In Stock"}</span>
          </div>
          <h3 className="product-list-card__title" style={{ color: cardText }}>{product.title}</h3>
          <p className="product-list-card__desc" style={{ color: cardSub }}>{product.description}</p>
          <StarRating rating={product.rating} />
          <div className="product-list-card__tags">
            {product.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="product-list-card__tag" style={{ borderColor: cardBorder, color: theme.accent }}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="product-list-card__right" style={{ background: cardBg }}>
          <div className="product-list-card__price-block">
            <span className="product-list-card__price" style={{ color: cardText }}>${product.price.toFixed(2)}</span>
            {hasDiscount && (
              <>
                <span className="product-list-card__was" style={{ color: cardSub }}>${originalPrice}</span>
                <span className="product-list-card__save">Save ${savings}</span>
              </>
            )}
          </div>
          {product.shippingInformation && (
            <p className="product-list-card__shipping" style={{ color: cardSub }}>{product.shippingInformation}</p>
          )}
          {product.warrantyInformation && (
            <p className="product-list-card__warranty" style={{ color: cardSub }}>🛡 {product.warrantyInformation}</p>
          )}
          <button
            className={`product-list-card__add-btn ${added ? "product-list-card__add-btn--added" : ""}`}
            onClick={handleAdd}
          >
            {added ? "✓ Added" : "Add to Cart"}
          </button>
          <button
            className="product-list-card__view-btn"
            style={{ borderColor: cardBorder, color: theme.accent }}
            onClick={(e) => { e.stopPropagation(); onClick(product.id); }}
          >
            View Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="product-card"
      style={cssVars}
      onClick={() => onClick(product.id)}
    >
      <div className="product-card__img-wrapper" style={{ background: imgBg }}>
        <img className="product-card__img" src={product.thumbnail} alt={product.title} loading="lazy" />
        {hasDiscount && <div className="product-card__disc-badge">−{Math.round(product.discountPercentage)}%</div>}
        <div className="product-card__stock-badge">{product.availabilityStatus || "In Stock"}</div>
      </div>
      <div className="product-card__body" style={{ background: cardBg }}>
        <div className="product-card__brand">{product.brand || product.category}</div>
        <div className="product-card__title">{product.title}</div>
        <StarRating rating={product.rating} />
        <div className="product-card__price-row">
          <span className="product-card__price-now">${product.price.toFixed(2)}</span>
          {hasDiscount && (
            <>
              <span className="product-card__price-was">${originalPrice}</span>
              <span className="product-card__disc-tag">Save ${savings}</span>
            </>
          )}
        </div>
        <div className="product-card__footer" style={{ borderTopColor: cardBorder }}>
          <div>
            <div className="product-card__category">{product.category}</div>
            {product.minimumOrderQuantity > 1 && (
              <div className="product-card__moq">MOQ: {product.minimumOrderQuantity}</div>
            )}
          </div>
          <button
            className={`product-card__add-btn ${added ? "product-card__add-btn--added" : ""}`}
            style={{ borderColor: cardBorder }}
            aria-label={`Add ${product.title} to cart`}
            onClick={handleAdd}
          >
            {added ? "✓" : "+"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategorySidebar({ categories, activeCategory, onSelect, theme, isDark }) {
  const sidebarBg     = isDark ? DARK.card   : theme.cardBg;
  const sidebarBorder = isDark ? DARK.border : theme.borderColor;
  const labelColor    = isDark ? DARK.muted  : theme.subText;
  const inactiveColor = isDark ? DARK.sub    : theme.subText;

  return (
    <aside className="catalog-sidebar" style={{ background: sidebarBg, borderColor: sidebarBorder }}>
      <p className="catalog-sidebar__label" style={{ color: labelColor }}>Categories</p>
      <ul className="catalog-sidebar__list">
        {["all", ...categories].map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <li key={cat}>
              <button
                className={`catalog-sidebar__item ${isActive ? "active" : ""}`}
                style={{
                  color:       isActive ? theme.accent : inactiveColor,
                  borderColor: isActive ? theme.accent : "transparent",
                  background:  isActive ? `rgba(${theme.accentRgb},0.12)` : "transparent",
                  transition:  "all 0.22s ease",
                }}
                onClick={() => onSelect(cat)}
              >
                <span className="catalog-sidebar__bar" style={{ background: isActive ? theme.accent : "transparent" }} />
                {cat === "all" ? "All Products" : cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ")}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

const Products = () => {
  const [products, setProducts]             = useState([]);
  const [filtered, setFiltered]             = useState([]);
  const [categories, setCategories]         = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortValue, setSortValue]           = useState("default");
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [viewMode, setViewMode]             = useState("grid");

  const { isDark } = useTheme();
  const theme = getTheme(activeCategory);

  const pageBg      = isDark ? DARK.bg      : theme.bg;
  const toolbarBg   = isDark ? DARK.card    : theme.cardBg;
  const toolbarBord = isDark ? DARK.border  : theme.borderColor;
  const countColor  = isDark ? DARK.sub     : theme.subText;
  const selectBg    = isDark ? DARK.surface : theme.bg;
  const selectBord  = isDark ? DARK.border  : theme.borderColor;
  const selectColor = isDark ? DARK.sub     : theme.subText;
  const gridGap     = isDark ? DARK.border  : theme.borderColor;

  useEffect(() => {
    axios
      .get("https://dummyjson.com/products?limit=100")
      .then((res) => {
        const data = res.data.products;
        setProducts(data);
        setFiltered(data);
        const cats = [...new Set(data.map((p) => p.category))].sort();
        setCategories(cats);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let list = activeCategory === "all" ? [...products] : products.filter((p) => p.category === activeCategory);
    if (sortValue === "price-asc")  list.sort((a, b) => a.price - b.price);
    if (sortValue === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sortValue === "rating")     list.sort((a, b) => b.rating - a.rating);
    if (sortValue === "discount")   list.sort((a, b) => b.discountPercentage - a.discountPercentage);
    setFiltered(list);
  }, [activeCategory, sortValue, products]);

  if (selectedProductId) {
    return (
      <ProductDetail
        productId={selectedProductId}
        onBack={() => setSelectedProductId(null)}
        onProductSelect={(id) => setSelectedProductId(id)}
        initialBg={pageBg}
      />
    );
  }

  return (
    <div className="catalog-root" style={{ background: pageBg, transition: "background 0.4s ease" }}>
      {loading && (
        <div className="catalog-loading">
          <span>Loading catalog</span>
          <div className="catalog-loading__dots">
            <span className="catalog-loading__dot" />
            <span className="catalog-loading__dot" />
            <span className="catalog-loading__dot" />
          </div>
        </div>
      )}

      {error && <div className="catalog-error">Failed to load products. Please try again.</div>}

      {!loading && !error && (
        <div
          className="catalog-top-row"
          style={{ background: pageBg }}
        >
          <CategoryHero theme={theme} category={activeCategory} />
          <CategorySidebar
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
            theme={theme}
            isDark={isDark}
          />
        </div>
      )}

      {!loading && !error && (
        <div
          className="catalog-toolbar"
          style={{
            background:   toolbarBg,
            borderTop:    `1px solid ${toolbarBord}`,
            borderBottom: `1px solid ${toolbarBord}`,
          }}
        >
          <span className="catalog-toolbar__count" style={{ color: countColor }}>
            Showing{" "}
            <span style={{ color: theme.accent, fontFamily: "'DM Mono', monospace" }}>{filtered.length}</span>{" "}
            products
          </span>

          <div className="catalog-toolbar__right">
            <span className="catalog-sort-label" style={{ color: countColor }}>Sort by</span>
            <select
              className="catalog-sort-select"
              value={sortValue}
              onChange={(e) => setSortValue(e.target.value)}
              style={{ background: selectBg, borderColor: selectBord, color: selectColor }}
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Best Discount</option>
            </select>

            <div className="catalog-view-toggle" style={{ borderColor: toolbarBord }}>
              <button
                className={`catalog-view-btn ${viewMode === "grid" ? "catalog-view-btn--active" : ""}`}
                style={{
                  color:      viewMode === "grid" ? theme.accent : countColor,
                  background: viewMode === "grid" ? `rgba(${theme.accentRgb},0.10)` : "transparent",
                }}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <GridIcon active={viewMode === "grid"} />
              </button>
              <button
                className={`catalog-view-btn ${viewMode === "list" ? "catalog-view-btn--active" : ""}`}
                style={{
                  color:      viewMode === "list" ? theme.accent : countColor,
                  background: viewMode === "list" ? `rgba(${theme.accentRgb},0.10)` : "transparent",
                }}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <ListIcon active={viewMode === "list"} />
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && viewMode === "grid" && (
        <div className="catalog-grid" style={{ background: gridGap }}>
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              theme={theme}
              onClick={setSelectedProductId}
              viewMode="grid"
              isDark={isDark}
            />
          ))}
        </div>
      )}

      {!loading && !error && viewMode === "list" && (
        <div className="catalog-list" style={{ background: pageBg }}>
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              theme={theme}
              onClick={setSelectedProductId}
              viewMode="list"
              isDark={isDark}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;