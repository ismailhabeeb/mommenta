import { useEffect, useState } from "react";
import { login, signup, logout, getCurrentUser } from "../services";
import AuthContext from "./authContextValue";
// import API from "../api.js"; // axios instance

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
  
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await getCurrentUser();
        setUser(res.data);
      } catch (error) {
        console.error("Unable to restore the signed-in user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();


     

  }, []);


  const handleLogin = async (data) => {
    const res = await login(data);
    const { token, user } = res.data;

    if (token) {
      localStorage.setItem("token", token);
    }

    const authenticatedUser = user ? { ...user, _id: user._id || user.id } : null;
    setUser(authenticatedUser);
    setLoading(false);
    if (authenticatedUser) localStorage.setItem("user", JSON.stringify(authenticatedUser));
    return res.data;
  };

  const handleSignup = async (data) => {
    const res = await signup(data);
    const { token, user } = res.data;

    if (token) {
      localStorage.setItem("token", token);
    }

    const authenticatedUser = user ? { ...user, _id: user._id || user.id } : null;
    setUser(authenticatedUser);
    setLoading(false);
    if (authenticatedUser) localStorage.setItem("user", JSON.stringify(authenticatedUser));
    return res.data;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        // preloading,
        login: handleLogin,
        signup: handleSignup,
        logout: handleLogout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
