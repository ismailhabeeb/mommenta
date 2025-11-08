import { createContext, useContext, useEffect, useState } from "react";
import { login, signup, logout, getCurrentUser } from "../services";
// import API from "../api.js"; // axios instance

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
  
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return null; // ⛔ avoid calling without token
        const res = await getCurrentUser(); // API already attaches token
        setUser(res.data);
        console.log(res.data)
      } catch {
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

    setUser(user || null);
    return res.data;
  };

  const handleSignup = async (data) => {
    const res = await signup(data);
    const { token, user } = res.data;

    if (token) {
      localStorage.setItem("token", token);
    }

    setUser(user || null);
    return res.data;
  };


  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("token");
    // delete API.defaults.headers.common["Authorization"];
    setUser(null);
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

export function useAuth() {
  return useContext(AuthContext);
}
