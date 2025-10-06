// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import Icon from "@mdi/react";
import {
    mdiThemeLightDark,
    mdiBellOutline,
    mdiLockOutline,
    mdiAccountPlus,
    mdiLogout,
} from "@mdi/js";

export default function Settings() {
    const [notifications, setNotifications] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Initialize theme on page load
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setDarkMode(true);
            document.documentElement.classList.add("dark");
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove("dark");
        }
    }, []);

    // Update theme when toggled
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    // Placeholder handlers
    const handleAddAccount = () => alert("Add Account clicked!");
    const handleLogout = () => alert("Logout clicked!");

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-6 flex flex-col gap-6">
            <h1 className="text-2xl font-bold mb-6 text-center md:text-left">
                Settings
            </h1>

            {/* Layout: Stack on mobile, grid on desktop */}
            <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6 gap-4">
                {/* Dark Mode */}
                <div className="card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Icon path={mdiThemeLightDark} size={1} />
                        <span>{darkMode ? "Dark Mode On" : "Dark Mode Off"}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={darkMode}
                            onChange={() => setDarkMode(!darkMode)}
                            className="sr-only"
                        />
                        {/* Track */}
                        <div
                            className={`w-11 h-6 rounded-full transition-colors duration-300
        ${darkMode ? "bg-brand" : "bg-gray-300 dark:bg-gray-600"}`}
                        ></div>
                        {/* Thumb */}
                        <div
                            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300
        ${darkMode ? "translate-x-5" : "translate-x-0"}`}
                        ></div>
                    </label>
                </div>


                {/* Notifications */}
                <div className="card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Icon path={mdiBellOutline} size={1} />
                        <span>Notifications</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={notifications}
                            onChange={() => setNotifications(!notifications)}
                            className="sr-only"
                        />
                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-brand transition-all"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform peer-checked:translate-x-5"></div>
                    </label>
                </div>

                {/* Change Password */}
                <div className="card flex flex-col gap-4 md:col-span-2">
                    <div className="flex items-center gap-3">
                        <Icon path={mdiLockOutline} size={1} />
                        <span>Change Password</span>
                    </div>
                    <input type="password" placeholder="New Password" className="input" />
                    <input type="password" placeholder="Confirm Password" className="input" />
                    <button className="btn-primary self-start">Update Password</button>
                </div>
            </div>

            {/* Account Actions: Stack on mobile, horizontal on desktop */}
            <div className="flex flex-col md:flex-row gap-3 mt-4">
                <button
                    className="btn btn-gradient flex items-center justify-center gap-2 md:flex-1"
                    onClick={handleAddAccount}
                >
                    <Icon path={mdiAccountPlus} size={1} />
                    Add Account
                </button>
                <button
                    className="btn btn-primary flex items-center justify-center gap-2 md:flex-1"
                    onClick={handleLogout}
                >
                    <Icon path={mdiLogout} size={1} />
                    Logout
                </button>
            </div>
        </div>
    );
}
