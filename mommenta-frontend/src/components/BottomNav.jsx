import { NavLink } from "react-router-dom";
import Icon from "@mdi/react";
import {
  mdiHomeOutline,
  mdiMagnify,
  mdiPlusBoxOutline,
  mdiPlayBoxOutline,
  mdiAccountCircleOutline,
  mdiBellOutline,
} from "@mdi/js";

export default function BottomNav({username}) {
  const navItems = [
    { to: "/", icon: mdiHomeOutline },
    { to: "/explore", icon: mdiMagnify },
    { to: "/create", icon: mdiPlusBoxOutline },
    { to: "/notifications", icon: mdiBellOutline },
    { to: `/profile/${username}`, icon: mdiAccountCircleOutline },
  ];

  return (
    <div className="fixed z-30 bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-14 lg:hidden">
      {navItems.map((item, idx) => (
        <NavLink
          key={idx}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center ${
              isActive ? "text-blue-500" : "text-gray-500"
            }`
          }
        >
          <Icon path={item.icon} size={1.2} />
        </NavLink>
      ))}
    </div>
  );
}
