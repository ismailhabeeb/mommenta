// src/components/TopBar.jsx
import Icon from "@mdi/react";
import { mdiMessageOutline, mdiBellOutline } from "@mdi/js";
import logo from "../assets/images/logo.png"; // your Mommenta logo

export default function TopBar() {
    return (
        <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 shadow-md flex items-center justify-between px-6 z-50">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <img src={logo} alt="Mommenta" className="w-10 h-10" />
                <span className="font-bold text-xl text-gray-800 dark:text-gray-100">Mommenta</span>
            </div>

            {/* Center (optional search or title) */}
            <div className="hidden md:flex flex-1 justify-center">
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-1/2 px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
                />
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-4">
                <Icon path={mdiMessageOutline} size={1.5} className="text-gray-600 dark:text-gray-300 cursor-pointer hover:text-brand transition" />
                {/* <Icon path={mdiBellOutline} size={1.5} className="text-gray-600 dark:text-gray-300 cursor-pointer hover:text-brand transition" /> */}
            </div>
        </div>
    );
}
