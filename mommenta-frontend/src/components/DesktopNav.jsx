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

export default function DesktopNav({ username = "me" }) {
  const location = useLocation();

  const navItems = [
    { icon: mdiHomeOutline, to: "/", label: "Home" },
    { icon: mdiMagnify, to: "/explore", label: "Explore" },
    { icon: mdiMessageOutline, to: "/messages", label: "Messages" },
    { icon: mdiBellOutline, to: "/notifications", label: "Notifications" },
    { icon: mdiAccountOutline, to: `/profile/${username}`, label: "Profile" }, // ✅ dynamic path
  ];

  return (
    <div className="hidden lg:flex flex-col fixed right-6 top-20 w-20 h-[calc(100vh-5rem)] bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-md p-4 justify-between">
      
      {/* Navigation Icons */}
      <div className="flex flex-col items-center gap-6">
        {navItems.map((item, idx) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <Link
              key={idx}
              to={item.to}
              title={item.label}
              className="flex flex-col items-center"
            >
              <Icon
                path={item.icon}
                size={1.5}
                className={`cursor-pointer transition ${
                  isActive
                    ? "text-brand dark:text-brand"
                    : "text-gray-600 dark:text-gray-300 hover:text-brand"
                }`}
              />
            </Link>
          );
        })}
      </div>

      {/* Create Button */}
      <Link
        to="/create"
        className="btn-gradient w-full flex flex-col items-center justify-center p-3 rounded-xl text-white font-medium shadow-md hover:opacity-90 transition"
      >
        <Icon path={mdiPlus} size={1.2} />
      </Link>
    </div>
  );
}
