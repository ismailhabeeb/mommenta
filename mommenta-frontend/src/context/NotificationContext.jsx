import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    clearNotifications as clearNotificationsRequest,
    fetchNotifications as fetchNotificationsRequest,
    markAsRead as markAsReadRequest,
    markAllNotificationsAsRead,
} from "../services";
import { useAuth } from "./useAuth";
import NotificationContext from "./notificationContextValue";

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth(); // 🧠 Get current logged-in user
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("");
    const requestId = useRef(0);
    const unreadCount = useMemo(
        () => notifications.filter((notification) => !notification.read).length,
        [notifications]
    );

    const fetchNotifications = useCallback(async () => {
        const currentRequest = ++requestId.current;
        if (!user) {
            setNotifications([]);
            setLoading(false);
            setError("");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await fetchNotificationsRequest();
            if (currentRequest === requestId.current) {
                setNotifications(res.data);
                setError("");
            }
        } catch (error) {
            if (currentRequest !== requestId.current) return;
            console.error("Unable to load notifications:", error);
            setError("Notifications could not be loaded. Please try again.");
        }
        finally {
            if (currentRequest === requestId.current) setLoading(false);
        }
    }, [user]);

    const markAllAsRead = useCallback(async () => {
        await markAllNotificationsAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, []);

    const markNotificationRead = useCallback(async (notificationId) => {
        await markAsReadRequest(notificationId);
        setNotifications((prev) =>
            prev.map((notification) =>
                notification._id === notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        );
    }, []);

    const clearAllNotifications = useCallback(async () => {
        await clearNotificationsRequest();
        setNotifications([]);
        setError("");
    }, []);

    const addNotification = useCallback((notification) => {
        setNotifications((current) =>
            current.some((item) => item._id === notification._id)
                ? current
                : [notification, ...current]
        );
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                error,
                fetchNotifications,
                markAllAsRead,
                markNotificationRead,
                clearAllNotifications,
                addNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
