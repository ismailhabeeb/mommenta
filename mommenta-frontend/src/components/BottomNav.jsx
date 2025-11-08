import { NavLink } from "react-router-dom";
import Icon from "@mdi/react";
import {
  mdiHomeOutline,
  mdiMagnify,
  mdiPlusBoxOutline,
  mdiAccountCircleOutline,
} from "@mdi/js";

export default function BottomNav({ username }) {
  return (
    <>
      {/* Wrapper for positioning */}
      <div className="fixed gap-3 bottom-4 left-1/2 -translate-x-1/2 w-[100%] max-w-md flex items-end justify-cente z-30 lg:hidden">
        {/* Glass Bottom Bar */}
        <div className="flex justify-around items-center w-[90%]  bg-white/30 dark:bg-gray-900/30 backdrop-blur-lg border border-gray-200/40 dark:border-gray-700/40 shadow-lg rounded-3xl px-6 py-3">
          {/* Home */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center transition ${
                isActive ? "text-blue-500" : "text-gray-500"
              }`
            }
          >
            <Icon path={mdiHomeOutline} size={1.2} />
          </NavLink>

          {/* Explore */}
          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center transition ${
                isActive ? "text-blue-500" : "text-gray-500"
              }`
            }
          >
            <Icon path={mdiMagnify} size={1.2} />
          </NavLink>

          {/* Create */}
          <NavLink
            to="/create"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center transition ${
                isActive ? "text-blue-500" : "text-gray-500"
              }`
            }
          >
            <Icon path={mdiPlusBoxOutline} size={1.2} />
          </NavLink>
        </div>

        {/* Floating Profile Button */}
        <NavLink
          to={`/profile/${username}`}
          className={({ isActive }) =>
            ` -top-2 right-0 items-end  sm:right-1 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/40 dark:border-gray-700/40 shadow-xl rounded-full p-2 transition duration-300 ${
              isActive
                ? "text-blue-500 scale-105 shadow-blue-300/40 dark:shadow-blue-900/40"
                : "text-gray-500 hover:scale-105 hover:text-blue-400"
            }`
          }
        >
          <Icon path={mdiAccountCircleOutline} size={1.6} />
        </NavLink>
      </div>
    </>
  );
}
