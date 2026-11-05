
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  getMyProfile,
} from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = sessionStorage.getItem("shopease_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getMyProfile();
        setUser(profile);
      } catch (error) {
        sessionStorage.removeItem("shopease_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const tokenData = await loginUser(email, password);

    sessionStorage.setItem(
      "shopease_token",
      tokenData.access_token
    );

    try {
      const profile = await getMyProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      sessionStorage.removeItem("shopease_token");
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("shopease_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
