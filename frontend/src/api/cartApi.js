import api from "./axios";

// Get logged-in user's cart
export const getCart = async () => {
  const response = await api.get("/cart/");
  return response.data;
};

// Add product to cart
export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post("/cart/add", {
    product_id: productId,
    quantity: quantity,
  });
  return response.data;
};

// Update cart item quantity
export const updateCartItem = async (itemId, quantity) => {
  const response = await api.put(`/cart/update/${itemId}`, {
    quantity: quantity,
  });
  return response.data;
};

// Remove product from cart
export const removeCartItem = async (itemId) => {
  const response = await api.delete(`/cart/remove/${itemId}`);
  return response.data;
};

// Clear entire cart
export const clearCart = async () => {
  const response = await api.delete("/cart/clear");
  return response.data;
};