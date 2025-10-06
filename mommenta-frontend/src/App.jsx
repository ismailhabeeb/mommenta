// src/App.jsx
import { AuthProvider } from "./context/AuthContext.jsx";
import Routerr from "./Router";
import { useEffect } from "react";
import "./index.css";
import { Toaster } from "react-hot-toast";

export default function App() {
  // Initialize dark mode on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <Routerr />
    </AuthProvider>
  );
}
