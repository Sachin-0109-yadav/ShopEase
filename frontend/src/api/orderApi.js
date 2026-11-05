
import api from "./axios";

export const placeOrder = async (orderData) => {
  const response = await api.post("/orders/place", orderData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get("/orders/");
  return response.data;
};
