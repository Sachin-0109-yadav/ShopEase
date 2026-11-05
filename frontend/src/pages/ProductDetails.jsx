
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart,
  ShoppingBag,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Star,
  MessageSquare,
  Pencil,
  Trash2,
} from "lucide-react";

import { getProductById } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../api/reviewApi";
import { useAuth } from "../context/AuthContext";

import "./ProductDetails.css";

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  // Review states
  const [reviewData, setReviewData] = useState({
    average_rating: 0,
    total_reviews: 0,
    reviews: [],
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Load product
  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProductById(productId);

        if (!cancelled) {
          setProduct(data);

          const primaryImage =
            data.images?.find((img) => img.is_primary) ||
            data.images?.[0];

          setSelectedImage(primaryImage?.image_url || "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
            "Unable to load this product."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  // Load product reviews
  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewError("");

        const data = await getProductReviews(productId);

        if (!cancelled) {
          setReviewData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setReviewError(
            err.response?.data?.detail ||
            "Unable to load product reviews."
          );
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const refreshReviews = async () => {
    const data = await getProductReviews(productId);
    setReviewData(data);
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (adding || product.stock_quantity <= 0) return;

    try {
      setAdding(true);
      setMessage("");

      await addToCart(product.id, 1);

      setMessage("Product added to your cart successfully!");
    } catch (err) {
      setMessage(
        err.response?.data?.detail ||
        "Unable to add this product to cart."
      );
    } finally {
      setAdding(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (submittingReview) return;

    try {
      setSubmittingReview(true);
      setReviewError("");
      setReviewMessage("");

      const reviewPayload = {
        rating: Number(rating),
        comment: comment.trim() || null,
      };

      if (editingReviewId) {
        await updateReview(editingReviewId, reviewPayload);
        setReviewMessage("Your review was updated successfully.");
      } else {
        await createReview(productId, reviewPayload);
        setReviewMessage("Your review was submitted successfully.");
      }

      setRating(5);
      setComment("");
      setEditingReviewId(null);

      await refreshReviews();
    } catch (err) {
      setReviewError(
        err.response?.data?.detail ||
        "Unable to submit your review."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment || "");
    setReviewError("");
    setReviewMessage("");
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setRating(5);
    setComment("");
    setReviewError("");
    setReviewMessage("");
  };

  const handleDeleteReview = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your review?"
    );

    if (!confirmed) return;

    try {
      setReviewError("");
      setReviewMessage("");

      await deleteReview(reviewId);

      if (editingReviewId === reviewId) {
        handleCancelEdit();
      }

      setReviewMessage("Your review was deleted successfully.");
      await refreshReviews();
    } catch (err) {
      setReviewError(
        err.response?.data?.detail ||
        "Unable to delete your review."
      );
    }
  };

  if (loading) {
    return (
      <div className="product-details-status">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-status">
        <h2>Product not found</h2>
        <p>{error || "This product is unavailable."}</p>
        <Link to="/">Back to Shop</Link>
      </div>
    );
  }

  const images = product.images || [];

  const currentPrice = Number(
    product.discount_price ?? product.price
  );

  const originalPrice = Number(product.price);

  const discount = product.discount_price
    ? Math.round(
        ((originalPrice - currentPrice) / originalPrice) * 100
      )
    : 0;

  const myReview = reviewData.reviews.find(
    (review) => Number(review.user_id) === Number(user?.id)
  );

  return (
    <main className="product-details-page">

      <Link to="/" className="product-back-link">
        <ArrowLeft size={18} />
        Continue Shopping
      </Link>

      <div className="product-details-container">

        {/* Product Images */}
        <section className="product-gallery">

          <div className="product-main-image">
            {selectedImage ? (
              <img src={selectedImage} alt={product.name} />
            ) : (
              <ShoppingBag size={65} />
            )}

            {discount > 0 && (
              <span className="details-discount">
                {discount}% OFF
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="product-thumbnails">
              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  className={
                    selectedImage === img.image_url
                      ? "thumbnail-active"
                      : ""
                  }
                  onClick={() => setSelectedImage(img.image_url)}
                >
                  <img src={img.image_url} alt={product.name} />
                </button>
              ))}
            </div>
          )}

        </section>

        {/* Product Information */}
        <section className="product-details-info">

          <span className="details-brand">
            {product.brand || "ShopEase"}
          </span>

          <h1>{product.name}</h1>

          <div className="details-rating-summary">
            <Star size={18} fill="#f59e0b" color="#f59e0b" />
            <strong>
              {Number(reviewData.average_rating || 0).toFixed(1)}
            </strong>
            <span>
              ({reviewData.total_reviews} reviews)
            </span>
          </div>

          <p className="details-description">
            {product.description || "No description available."}
          </p>

          <div className="details-price">
            <strong>
              ₹{currentPrice.toLocaleString("en-IN")}
            </strong>

            {product.discount_price && (
              <>
                <del>
                  ₹{originalPrice.toLocaleString("en-IN")}
                </del>

                <span>{discount}% OFF</span>
              </>
            )}
          </div>

          <p className={
            product.stock_quantity > 0
              ? "details-in-stock"
              : "details-out-stock"
          }>
            {product.stock_quantity > 0
              ? `${product.stock_quantity} items available`
              : "Currently out of stock"}
          </p>

          <button
            type="button"
            className="details-cart-button"
            onClick={handleAddToCart}
            disabled={adding || product.stock_quantity <= 0}
          >
            <ShoppingCart size={19} />

            {adding
              ? "Adding..."
              : product.stock_quantity <= 0
              ? "Out of Stock"
              : "Add to Cart"}
          </button>

          {message && (
            <p className="details-message">{message}</p>
          )}

          <div className="details-benefits">
            <div>
              <Truck size={22} />
              <span>Convenient Shopping</span>
            </div>

            <div>
              <ShieldCheck size={22} />
              <span>Secure Shopping Experience</span>
            </div>
          </div>

          <div className="details-extra">
            <h3>Product Information</h3>

            <p>
              <strong>Product:</strong> {product.name}
            </p>

            <p>
              <strong>Brand:</strong> {product.brand || "ShopEase"}
            </p>

            <p>
              <strong>Availability:</strong>{" "}
              {product.stock_quantity > 0
                ? "In Stock"
                : "Out of Stock"}
            </p>
          </div>

        </section>
      </div>

      {/* Product Reviews */}
      <section className="product-reviews-section">

        <div className="reviews-heading">
          <div>
            <h2>Customer Reviews</h2>
            <p>Ratings and feedback from our customers</p>
          </div>

          <div className="reviews-overall-rating">
            <Star size={23} fill="#f59e0b" color="#f59e0b" />
            <strong>
              {Number(reviewData.average_rating || 0).toFixed(1)}
            </strong>
            <span>
              / 5 ({reviewData.total_reviews} reviews)
            </span>
          </div>
        </div>

        {/* Review Form */}
        {user ? (
          <div className="review-form-container">
            <h3>
              {editingReviewId ? "Edit Your Review" : "Write a Review"}
            </h3>

            {myReview && !editingReviewId && (
              <p>You have already reviewed this product. You can edit your existing review below.</p>
            )}

            {!myReview && (
              <p>You must have ordered this product to submit a review.</p>
            )}

            {!myReview || editingReviewId ? (
              <form onSubmit={handleReviewSubmit} className="review-form">

                <label>Choose your rating</label>

                <div className="review-star-selector">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`Rate ${value} stars`}
                      className={value <= rating ? "selected" : ""}
                      onClick={() => setRating(value)}
                    >
                      <Star
                        size={27}
                        fill={value <= rating ? "#f59e0b" : "none"}
                        color={value <= rating ? "#f59e0b" : "#999"}
                      />
                    </button>
                  ))}
                </div>

                <label htmlFor="review-comment">
                  Your feedback
                </label>

                <textarea
                  id="review-comment"
                  rows="4"
                  maxLength="2000"
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />

                <div className="review-form-actions">
                  <button
                    type="submit"
                    className="review-submit-button"
                    disabled={submittingReview}
                  >
                    {submittingReview
                      ? "Submitting..."
                      : editingReviewId
                      ? "Update Review"
                      : "Submit Review"}
                  </button>

                  {editingReviewId && (
                    <button
                      type="button"
                      className="review-cancel-button"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  )}
                </div>

              </form>
            ) : null}
          </div>
        ) : (
          <div className="review-login-message">
            <p>Please log in to write a product review.</p>
            <Link to="/login">Login to Review</Link>
          </div>
        )}

        {reviewError && (
          <p className="review-error-message">{reviewError}</p>
        )}

        {reviewMessage && (
          <p className="review-success-message">{reviewMessage}</p>
        )}

        {/* Reviews List */}
        <div className="reviews-list">

          {reviewsLoading ? (
            <p>Loading customer reviews...</p>
          ) : reviewData.reviews.length === 0 ? (
            <div className="no-reviews-message">
              <MessageSquare size={35} />
              <h3>No reviews yet</h3>
              <p>Be the first customer to review this product.</p>
            </div>
          ) : (
            reviewData.reviews.map((review) => {
              const isMyReview =
                Number(review.user_id) === Number(user?.id);

              return (
                <article className="review-card" key={review.id}>

                  <div className="review-card-header">
                    <div>
                      <h4>{review.user?.full_name || "Customer"}</h4>

                      <div className="review-card-stars">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            size={16}
                            fill={value <= review.rating ? "#f59e0b" : "none"}
                            color={value <= review.rating ? "#f59e0b" : "#ccc"}
                          />
                        ))}
                      </div>
                    </div>

                    <span>
                      {new Date(review.created_at).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <p className="review-card-comment">
                    {review.comment || "No written feedback provided."}
                  </p>

                  {isMyReview && (
                    <div className="review-card-actions">
                      <button
                        type="button"
                        onClick={() => handleEditReview(review)}
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  )}

                </article>
              );
            })
          )}

        </div>
      </section>

    </main>
  );
}
