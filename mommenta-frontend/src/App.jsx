// src/App.jsx
import { AuthProvider } from "./context/AuthContext.jsx";
import Routerr from "./Router";
import { useEffect, useState } from "react";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { ChatDrawerProvider } from "./context/ChatDrawerContext.jsx";
import Preloader from "./components/Preloader"; // <-- import preloader

export default function App() {
  const [loading, setLoading] = useState(true);

  // Initialize dark mode on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Simulate loading time for preloader (1.2s)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Show preloader first
  if (loading) return <Preloader />;

  return (
    <AuthProvider>
      <NotificationProvider>
        <SocketProvider>
          <ChatDrawerProvider>
            <Toaster position="top-center" />
            <Routerr />
          </ChatDrawerProvider>
        </SocketProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
