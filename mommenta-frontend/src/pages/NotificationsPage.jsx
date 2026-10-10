import { useState } from "react";
import { useNotifications } from "../context/useNotifications";
import { useAuth } from "../context/useAuth";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const notificationText = (notification) => {
  if (notification.message) return notification.message;
  if (notification.type === "follow") return "started following you.";
  if (notification.type === "followRequest") return "requested to follow you.";
  if (notification.type === "like") return "liked your post.";
  return "commented on your post.";
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAllAsRead,
    markNotificationRead,
    clearAllNotifications,
  } = useNotifications();
  const [busy, setBusy] = useState(false);

  const handleMarkAll = async () => {
    setBusy(true);
    try {
      await markAllAsRead();
      toast.success("Notifications marked as read.");
    } catch (error) {
      console.error("Unable to mark notifications as read:", error);
      toast.error("Unable to update notifications.");
    } finally {
      setBusy(false);
    }
  };

  const handleClear = async () => {
    setBusy(true);
    try {
      await clearAllNotifications();
    } catch (error) {
      console.error("Unable to clear notifications:", error);
      toast.error("Unable to clear notifications.");
    } finally {
      setBusy(false);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
    } catch (error) {
      console.error("Unable to mark notification as read:", error);
      toast.error("Unable to update notification.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-black dark:text-gray-100 sm:px-6">
      <section className="mx-auto max-w-2xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              Your activity
            </p>
            <h1 className="text-3xl font-heading font-semibold">Notifications</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {unreadCount ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
          {!!notifications.length && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  disabled={busy}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-brand hover:bg-purple-50 disabled:opacity-50 dark:hover:bg-gray-900"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                disabled={busy}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-900"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {loading ? (
            <div className="space-y-4 p-5" aria-label="Loading notifications">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p role="alert" className="text-sm text-red-600">{error}</p>
              <button
                type="button"
                onClick={fetchNotifications}
                className="mt-3 text-sm font-semibold text-brand hover:underline"
              >
                Retry
              </button>
            </div>
          ) : notifications.length ? (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`flex items-center gap-3 p-4 ${
                    notification.read ? "" : "bg-purple-50/70 dark:bg-purple-950/20"
                  }`}
                >
                  <img
                    src={notification.sender?.profilePic || "https://api.dicebear.com/9.x/thumbs/svg?seed=placeholder"}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1 text-sm">
                    <p>
                      <span className="font-semibold">
                        {notification.sender?.username || "Someone"}
                      </span>{" "}
                      {notificationText(notification)}
                    </p>
                    <time className="mt-1 block text-xs text-gray-500" dateTime={notification.createdAt}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </time>
                    {notification.type === "followRequest" && (
                      <Link
                        to={`/profile/${user?._id || user?.id}`}
                        className="mt-1 inline-block text-xs font-semibold text-brand hover:underline"
                      >
                        Review request
                      </Link>
                    )}
                  </div>
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(notification._id)}
                      className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-brand hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand dark:hover:bg-gray-800"
                    >
                      Mark read
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 py-14 text-center text-sm text-gray-500">
              No notifications yet. Your activity will show up here.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
