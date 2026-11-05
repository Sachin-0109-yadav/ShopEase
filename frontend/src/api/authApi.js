
import api from "./axios";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (email, password) => {
  const formData = new URLSearchParams();

  // FastAPI OAuth2 login expects username, not email.
  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
