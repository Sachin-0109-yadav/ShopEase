
import api from "./axios";

// Get logged-in user's wishlist
export const getWishlist = async () => {
  const response = await api.get("/wishlist/");
  return response.data;
};

// Add product to wishlist
export const addToWishlist = async (productId) => {
  const response = await api.post("/wishlist/add", {
    product_id: productId,
  });
  return response.data;
};

// Remove product from wishlist
export const removeFromWishlist = async (itemId) => {
  const response = await api.delete(`/wishlist/remove/${itemId}`);
  return response.data;
};

// Move wishlist product to cart
export const moveWishlistItemToCart = async (itemId) => {
  const response = await api.post(
    `/wishlist/move-to-cart/${itemId}`
  );
  return response.data;
};
