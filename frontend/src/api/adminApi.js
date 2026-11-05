
import api from "./axios";

// ======================================
// PRODUCT MANAGEMENT
// ======================================

export const getAdminProducts = async () => {
  const response = await api.get("/admin/products/");
  return response.data;
};

export const createAdminProduct = async (productData) => {
  const response = await api.post("/admin/products/", productData);
  return response.data;
};

export const updateAdminProduct = async (productId, productData) => {
  const response = await api.patch(
    `/admin/products/${productId}`,
    productData
  );
  return response.data;
};

export const deactivateAdminProduct = async (productId) => {
  const response = await api.delete(`/admin/products/${productId}`);
  return response.data;
};

// ======================================
// PRODUCT IMAGE MANAGEMENT
// ======================================

export const uploadProductImage = async (
  productId,
  imageFile,
  altText = "",
  isPrimary = false
) => {
  const formData = new FormData();

  formData.append("file", imageFile);
  formData.append("alt_text", altText);
  formData.append("is_primary", String(isPrimary));

  const response = await api.post(
    `/admin/products/${productId}/images`,
    formData
  );

  return response.data;
};

export const setPrimaryProductImage = async (productId, imageId) => {
  const response = await api.patch(
    `/admin/products/${productId}/images/${imageId}/primary`
  );

  return response.data;
};

export const deleteProductImage = async (productId, imageId) => {
  const response = await api.delete(
    `/admin/products/${productId}/images/${imageId}`
  );

  return response.data;
};

// ======================================
// ADMIN ORDER MANAGEMENT
// ======================================

export const getAdminOrders = async () => {
  const response = await api.get("/admin/orders/");
  return response.data;
};

export const getAdminOrderDetails = async (orderId) => {
  const response = await api.get(`/admin/orders/${orderId}`);
  return response.data;
};

export const updateAdminOrderStatus = async (orderId, status) => {
  const response = await api.patch(
    `/admin/orders/${orderId}/status`,
    { status }
  );

  return response.data;
};

// ======================================
// ADMIN CATEGORY MANAGEMENT
// ======================================

export const getAdminCategories = async () => {
  const response = await api.get("/admin/categories/");
  return response.data;
};

export const createAdminCategory = async (categoryData) => {
  const response = await api.post("/admin/categories/", categoryData);
  return response.data;
};

export const updateAdminCategory = async (categoryId, categoryData) => {
  const response = await api.patch(
    `/admin/categories/${categoryId}`,
    categoryData
  );
  return response.data;
};

export const deactivateAdminCategory = async (categoryId) => {
  const response = await api.delete(
    `/admin/categories/${categoryId}`
  );
  return response.data;
};
