import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth(); // 🧠 Get current logged-in user
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState()

    const fetchNotifications = async () => {
        if (!user) return; // ⛔ skip if not logged in

        try {
            const res = await fetchNotifications();
            console.log(res.data)
            console.log("e work")
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n) => !n.read).length);
        } catch {
        }
        finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put("/api/notifications/mark-all", {}, { withCredentials: true });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user]); // refetch when user changes (login/logout)

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, fetchNotifications, markAllAsRead }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
