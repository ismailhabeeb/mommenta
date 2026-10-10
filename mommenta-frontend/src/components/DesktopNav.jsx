import Icon from "@mdi/react";
import {
  mdiHomeOutline,
  mdiMagnify,
  mdiAccountOutline,
  mdiMessageOutline,
  mdiBellOutline,
  mdiPlus,
} from "@mdi/js";
import { Link, useLocation } from "react-router-dom";
import { useChatDrawer } from "../context/useChatDrawer";
import { useAuth } from "../context/useAuth";

export default function DesktopNav({ username }) {
  const location = useLocation();
 const { isDrawerOpen, openChatDrawer, closeChat } =
    useChatDrawer();

   const toggleChatPanel = () => {
    if (isDrawerOpen) closeChat();
    else openChatDrawer();
  };

  const { user } = useAuth();

  const currentUsername = username || user?._id || user?.id || "me";

  return (
    <div className="hidden lg:flex flex-col fixed right-6 top-20 w-20 h-[calc(100vh-5rem)] bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-md p-4 justify-between">
      {/* 🔹 Navigation Icons */}
      <div className="flex flex-col items-center gap-6">

        {/* 🏠 Home */}
        <Link         to="/home" title="Home" className="flex flex-col items-center">
          <Icon
            path={mdiHomeOutline}
            size={1.5}
            className={`cursor-pointer transition ${location.pathname === "/"
                ? "text-brand dark:text-brand"
                : "text-gray-600 dark:text-gray-300 hover:text-brand"
              }`}
          />
        </Link>

        {/* 🔍 Explore */}
        <Link
          to="/explore"
          title="Explore"
          className="flex flex-col items-center"
        >
          <Icon
            path={mdiMagnify}
            size={1.5}
            className={`cursor-pointer transition ${location.pathname.startsWith("/explore")
                ? "text-brand dark:text-brand"
                : "text-gray-600 dark:text-gray-300 hover:text-brand"
              }`}
          />
        </Link>

        {/* 💬 Messages — opens chat drawer instead of redirect */}
        <button
          onClick={toggleChatPanel}
          title="Messages"
          aria-label="Open messages"
          className="flex flex-col items-center focus:outline-none"
        >
          <Icon
            path={mdiMessageOutline}
            size={1.5}
            className={`cursor-pointer transition ${location.pathname.startsWith("/messages")
                ? "text-brand dark:text-brand"
                : "text-gray-600 dark:text-gray-300 hover:text-brand"
              }`}
          />
        </button>

        {/* 🔔 Notifications */}
        <Link
          to="/notifications"
          title="Notifications"
          className="flex flex-col items-center"
        >
          <Icon
            path={mdiBellOutline}
            size={1.5}
            className={`cursor-pointer transition ${location.pathname.startsWith("/notifications")
                ? "text-brand dark:text-brand"
                : "text-gray-600 dark:text-gray-300 hover:text-brand"
              }`}
          />
        </Link>

        {/* 👤 Profile */}
        <Link
          to={`/profile/${currentUsername}`}
          title="Profile"
          className="flex flex-col items-center"
        >
          <Icon
            path={mdiAccountOutline}
            size={1.5}
            className={`cursor-pointer transition ${location.pathname.startsWith(`/profile/${currentUsername}`)
                ? "text-brand dark:text-brand"
                : "text-gray-600 dark:text-gray-300 hover:text-brand"
              }`}
          />
        </Link>
      </div>

      {/* ➕ Create Button */}
      <Link
        to="/create"
        className="btn-gradient w-full flex flex-col items-center justify-center p-3 rounded-xl text-white font-medium shadow-md hover:opacity-90 transition"
      >
        <Icon path={mdiPlus} size={1.2} />
      </Link>
    </div>
  );
}
