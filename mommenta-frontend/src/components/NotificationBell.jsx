// src/components/NotificationBell.jsx
import { useState, useRef, useEffect } from "react";
// import { useNotifications } from "@/context/NotificationContext";
import Icon from "@mdi/react";
import { mdiBellOutline } from "@mdi/js";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 🔒 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Icon path={mdiBellOutline} size={1.1} />
        uu
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full px-1.5">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 📥 Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 z-50">
          <div className="flex justify-between items-center p-3 border-b dark:border-gray-700">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-brand hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* 🧾 Notification List */}
          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                    !n.read ? "bg-gray-50 dark:bg-gray-900" : ""
                  }`}
                >
                  <img
                    src={n.sender?.profilePic || "/default-avatar.png"}
                    alt="sender"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      <span className="font-semibold">{n.sender?.username}</span>{" "}
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No notifications
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
