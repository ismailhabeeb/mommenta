import { useEffect, useState } from "react";
import { login, signup, logout, getCurrentUser } from "../services";
import AuthContext from "./authContextValue";
// import API from "../api.js"; // axios instance
import {
  listenForForegroundMessages,
  registerGrantedDeviceToken,
  removeCurrentDeviceToken,
} from "../services/pushNotifications.js";
import { PUSH_OPT_IN_KEY } from "../firebase.js";

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

  const userId = user?.id || user?._id;

  useEffect(() => {
    if (
      loading ||
      !userId
    ) {
      return undefined;
    }

    let active = true;
    let unsubscribe = () => {};

    (async () => {
      const stopListening = await listenForForegroundMessages();
      if (active) unsubscribe = stopListening;
      else stopListening();

      if (
        localStorage.getItem(PUSH_OPT_IN_KEY) === "true" &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        await registerGrantedDeviceToken();
      }
    })().catch(() => {
      // Push registration is optional; keep the authenticated app usable.
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [loading, userId]);


  const handleLogin = async (data) => {
    const res = await login(data);
    const { token, user } = res.data;

    const nextUserId = user?.id || user?._id;
    if (userId && nextUserId && userId !== nextUserId) {
      try {
        await removeCurrentDeviceToken();
      } catch {
        // Registration for the next account will transfer token ownership.
      }
    }

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

    const nextUserId = user?.id || user?._id;
    if (userId && nextUserId && userId !== nextUserId) {
      try {
        await removeCurrentDeviceToken();
      } catch {
        // Registration for the next account will transfer token ownership.
      }
    }

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
      await removeCurrentDeviceToken();
    } catch {
      // Best-effort cleanup; signing out must still complete.
    }

    try {
      await logout();
    } catch {
      // Clear the local session even if the server logout request fails.
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
