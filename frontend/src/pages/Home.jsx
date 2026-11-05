
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Headphones,
  Star,
  ArrowRight,
  Menu,
  X,
  Tag,
  Heart,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { addToCart } from "../api/cartApi";
import { getProducts, getCategories } from "../api/productApi";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../api/wishlistApi";

import "../App.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);

  const productsRef = useRef(null);

  // Fetch products and categories
  useEffect(() => {
    let ignore = false;

    const loadStoreData = async () => {
      try {
        const [productData, categoryData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        if (!ignore) {
          setProducts(productData);
          setCategories(categoryData);
        }
      } catch (err) {
        console.error("ShopEase API error:", err);

        if (!ignore) {
          setError(
            err.response?.data?.detail ||
              "Unable to load ShopEase. Please check your backend connection."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadStoreData();

    return () => {
      ignore = true;
    };
  }, []);

  // Load wishlist for logged-in user
  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setWishlistItems([]);
      return;
    }

    getWishlist()
      .then((data) => {
        if (!cancelled) {
          setWishlistItems(data.items || []);
        }
      })
      .catch((err) => {
        console.error("Wishlist loading error:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Add or remove product from wishlist
  const handleToggleWishlist = async (productId) => {
    const existingItem = wishlistItems.find(
      (item) => item.product.id === productId
    );

    const data = existingItem
      ? await removeFromWishlist(existingItem.id)
      : await addToWishlist(productId);

    setWishlistItems(data.items || []);
  };

  // Search and category filtering
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        String(product.category_id) === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  const featuredProducts = products.filter(
    (product) => product.is_featured
  );

  // Scroll to products
  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // Loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <ShoppingBag size={40} />
        <h2>ShopEase</h2>
        <p>Loading your shopping experience...</p>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="error-screen">
        <h2>Something went wrong</h2>
        <p>{error}</p>

        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="app">

      {/* Announcement Bar */}
      <div className="announcement">
        <Truck size={15} />
        <span>
          Discover great products at great prices with ShopEase
        </span>
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-container">

          <Link to="/" className="logo">
            <span className="logo-icon">
              <ShoppingBag size={23} />
            </span>

            <span>
              Shop<span>Ease</span>
            </span>
          </Link>

          <nav className={`navigation ${mobileMenu ? "nav-open" : ""}`}>
            <Link to="/" onClick={() => setMobileMenu(false)}>
              Home
            </Link>

            <a href="#categories" onClick={() => setMobileMenu(false)}>
              Categories
            </a>

            <a href="#products" onClick={() => setMobileMenu(false)}>
              Products
            </a>

            <a href="#offers" onClick={() => setMobileMenu(false)}>
              Offers
            </a>
          </nav>

          <div className="header-actions">

            <div className="header-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedCategory("all");
                }}
              />
            </div>

            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Toggle navigation"
            >
              {mobileMenu ? <X /> : <Menu />}
            </button>

          </div>
        </div>
      </header>

      <main>

        {/* Hero Section */}
        <section className="hero" id="offers">

          <div className="hero-content">

            <span className="hero-tag">
              <Tag size={15} />
              YOUR EVERYDAY SHOPPING DESTINATION
            </span>

            <h1>
              Shopping made
              <span> simple and easy.</span>
            </h1>

            <p>
              Explore electronics, fashion and home essentials.
              Find products you love, all in one place.
            </p>

            <button
              className="primary-button"
              onClick={scrollToProducts}
            >
              Explore Products
              <ArrowRight size={18} />
            </button>

            <div className="hero-stats">

              <div>
                <strong>{products.length}+</strong>
                <span>Products</span>
              </div>

              <div>
                <strong>{categories.length}</strong>
                <span>Categories</span>
              </div>

              <div>
                <strong>Easy</strong>
                <span>Shopping</span>
              </div>

            </div>
          </div>

          <div className="hero-image">

            <img
              src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200"
              alt="Shopping experience"
            />

            <div className="hero-floating-card">
              <ShoppingBag size={22} />

              <div>
                <strong>Shop your favourites</strong>
                <span>Explore ShopEase</span>
              </div>
            </div>

          </div>
        </section>

        {/* Benefits */}
        <section className="benefits">

          <div className="benefit">
            <Truck />

            <div>
              <strong>Convenient Shopping</strong>
              <span>Shop from anywhere</span>
            </div>
          </div>

          <div className="benefit">
            <ShieldCheck />

            <div>
              <strong>Secure Experience</strong>
              <span>Protected user accounts</span>
            </div>
          </div>

          <div className="benefit">
            <Headphones />

            <div>
              <strong>Customer Support</strong>
              <span>We're here to help</span>
            </div>
          </div>

        </section>

        {/* Categories */}
        <section className="section" id="categories">

          <div className="section-heading">

            <div>
              <span className="section-label">
                EXPLORE OUR STORE
              </span>

              <h2>Shop by Category</h2>

              <p>
                Find what you need from our collections.
              </p>
            </div>

            <button
              className="text-button"
              onClick={() => {
                setSelectedCategory("all");
                scrollToProducts();
              }}
            >
              View All
              <ArrowRight size={16} />
            </button>

          </div>

          <div className="category-grid">

            {categories.map((category) => (
              <button
                className={`category-card ${
                  selectedCategory === String(category.id)
                    ? "category-selected"
                    : ""
                }`}
                key={category.id}
                onClick={() => {
                  setSelectedCategory(String(category.id));
                  scrollToProducts();
                }}
              >

                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                  />
                ) : (
                  <div className="category-placeholder">
                    <ShoppingBag size={35} />
                  </div>
                )}

                <div className="category-overlay">
                  <h3>{category.name}</h3>

                  <span>
                    Explore Collection
                    <ArrowRight size={15} />
                  </span>
                </div>

              </button>
            ))}

          </div>
        </section>

        {/* Featured Products */}
        <section className="section featured-section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                HANDPICKED FOR YOU
              </span>

              <h2>Featured Products</h2>

              <p>
                Discover some of our highlighted products.
              </p>
            </div>

          </div>

          <div className="product-grid">

            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlistItem={wishlistItems.find(
                  (item) => item.product.id === product.id
                )}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}

          </div>
        </section>

        {/* All Products */}
        <section
          className="section products-section"
          id="products"
          ref={productsRef}
        >

          <div className="section-heading">

            <div>
              <span className="section-label">
                OUR COLLECTION
              </span>

              <h2>Explore All Products</h2>

              <p>
                Browse our available products.
              </p>
            </div>

          </div>

          {/* Category Filters */}
          <div className="filter-bar">

            <div className="category-filters">

              <button
                className={
                  selectedCategory === "all"
                    ? "filter-active"
                    : ""
                }
                onClick={() => setSelectedCategory("all")}
              >
                All Products
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  className={
                    selectedCategory === String(category.id)
                      ? "filter-active"
                      : ""
                  }
                  onClick={() =>
                    setSelectedCategory(String(category.id))
                  }
                >
                  {category.name}
                </button>
              ))}

            </div>

            <span className="result-count">
              {filteredProducts.length} products found
            </span>

          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (

            <div className="product-grid">

              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlistItem={wishlistItems.find(
                    (item) => item.product.id === product.id
                  )}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}

            </div>

          ) : (

            <div className="empty-state">
              <Search size={35} />

              <h3>No products found</h3>

              <p>
                Try another search or select a different category.
              </p>

              <button
                className="primary-button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </button>
            </div>

          )}

        </section>
      </main>

      {/* Footer */}
      <footer className="footer">

        <div className="footer-main">

          <div className="footer-brand">

            <Link to="/" className="logo footer-logo">
              <span className="logo-icon">
                <ShoppingBag size={23} />
              </span>

              <span>
                Shop<span>Ease</span>
              </span>
            </Link>

            <p>
              Your everyday shopping destination.
              Explore products across different categories.
            </p>

          </div>

          <div>
            <h4>Explore</h4>
            <a href="#categories">Categories</a>
            <a href="#products">All Products</a>
            <a href="#offers">Offers</a>
          </div>

          <div>
            <h4>ShopEase</h4>
            <Link to="/">Home</Link>
            <a href="#products">Our Collection</a>
          </div>

        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} ShopEase. All rights reserved.
          </p>

          <p>
            Made for a better shopping experience.
          </p>
        </div>

      </footer>
    </div>
  );
}


// Reusable Product Card Component

function ProductCard({
  product,
  wishlistItem,
  onToggleWishlist,
}) {
  const image =
    product.images?.find((item) => item.is_primary) ||
    product.images?.[0];

  const currentPrice = Number(
    product.discount_price ?? product.price
  );

  const originalPrice = Number(product.price);

  const discount = product.discount_price
    ? Math.round(
        ((originalPrice - currentPrice) / originalPrice) * 100
      )
    : 0;

  const { user } = useAuth();
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  // Add product to cart
  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (product.stock_quantity <= 0 || adding) {
      return;
    }

    try {
      setAdding(true);
      setCartMessage("");
      setCartError("");

      await addToCart(product.id, 1);

      setCartMessage("Added to your cart successfully!");
    } catch (err) {
      setCartError(
        err.response?.data?.detail ||
          "Unable to add this product. Please try again."
      );
    } finally {
      setAdding(false);
    }
  };

  // Add or remove product from wishlist
  const handleWishlistClick = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (wishlistBusy) return;

    try {
      setWishlistBusy(true);
      setWishlistError("");

      await onToggleWishlist(product.id);
    } catch (err) {
      setWishlistError(
        err.response?.data?.detail ||
          "Unable to update wishlist."
      );
    } finally {
      setWishlistBusy(false);
    }
  };

  return (
    <article className="product-card">

      <div className="product-image">

        {image ? (
          <img
            src={image.image_url}
            alt={image.alt_text || product.name}
            loading="lazy"
          />
        ) : (
          <div className="image-placeholder">
            <ShoppingBag size={40} />
            <span>Image unavailable</span>
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          className={`wishlist-heart-button ${
            wishlistItem ? "is-wishlisted" : ""
          }`}
          onClick={handleWishlistClick}
          disabled={wishlistBusy}
          aria-label={
            wishlistItem
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          title={
            wishlistItem
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          <Heart
            size={19}
            fill={wishlistItem ? "currentColor" : "none"}
          />
        </button>

        {discount > 0 && (
          <span className="discount-badge">
            {discount}% OFF
          </span>
        )}

        {product.stock_quantity === 0 && (
          <span className="stock-badge">
            Out of stock
          </span>
        )}

      </div>

      <div className="product-info">

        <span className="product-brand">
          {product.brand || "ShopEase"}
        </span>

        <h3>{product.name}</h3>

        {/* View Product Details */}
        <Link
          to={`/products/${product.id}`}
          className="view-details-link"
        >
          View Details
          <ArrowRight size={15} />
        </Link>

        <div className="product-rating">
          <Star size={15} fill="currentColor" />

          <span>
            {Number(product.rating || 0).toFixed(1)}
          </span>

          <span className="review-count">
            ({product.review_count || 0} reviews)
          </span>
        </div>

        <div className="product-price">
          <strong>
            ₹{currentPrice.toLocaleString("en-IN")}
          </strong>

          {product.discount_price && (
            <del>
              ₹{originalPrice.toLocaleString("en-IN")}
            </del>
          )}
        </div>

        <span className="stock-info">
          {product.stock_quantity > 0
            ? `${product.stock_quantity} available`
            : "Currently unavailable"}
        </span>

        <button
          type="button"
          className="add-to-cart-button"
          onClick={handleAddToCart}
          disabled={product.stock_quantity <= 0 || adding}
        >
          <ShoppingCart size={17} />

          {adding
            ? "Adding..."
            : product.stock_quantity <= 0
            ? "Out of Stock"
            : "Add to Cart"}
        </button>

        {cartMessage && (
          <p className="cart-card-success">
            {cartMessage}
          </p>
        )}

        {cartError && (
          <p className="cart-card-error">
            {cartError}
          </p>
        )}

        {wishlistError && (
          <p className="wishlist-card-error">
            {wishlistError}
          </p>
        )}

      </div>
    </article>
  );
}
