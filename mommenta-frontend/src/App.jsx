// src/App.jsx
import { AuthProvider } from "./context/AuthContext.jsx";
import Routerr from "./Router";
import { useEffect } from "react";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { ChatDrawerProvider } from "./context/ChatDrawerContext.jsx";

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
