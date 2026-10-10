// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import Icon from "@mdi/react";
import {
    mdiThemeLightDark,
    mdiLockOutline,
    mdiAccountPlus,
    mdiLogout,
} from "@mdi/js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { changePassword, updatePrivacy } from "../services";
import toast from "react-hot-toast";

export default function Settings() {
    const [darkMode, setDarkMode] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);
    const [savingPrivacy, setSavingPrivacy] = useState(false);
    const navigate = useNavigate();
    const { user, logout, setUser } = useAuth();

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

    useEffect(() => {
        setIsPrivate(Boolean(user?.isPrivate));
    }, [user]);

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
    // const handleLogout = () => alert("Logout clicked!");

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Server logout failed:", error);
            toast.error("Signed out locally; the server could not confirm logout.");
        } finally {
            navigate("/login");
        }
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setSavingPassword(true);
        try {
            await changePassword({ oldPassword, newPassword });
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast.success("Password updated.");
        } catch (error) {
            console.error("Password update failed:", error);
            toast.error(error.response?.data?.msg || "Unable to update password.");
        } finally {
            setSavingPassword(false);
        }
    };

    const handlePrivacyChange = async () => {
        setSavingPrivacy(true);
        try {
            const { data } = await updatePrivacy();
            setIsPrivate(data.isPrivate);
            setUser((current) =>
                current ? { ...current, isPrivate: data.isPrivate } : current
            );
            toast.success(`Account is now ${data.isPrivate ? "private" : "public"}.`);
        } catch (error) {
            console.error("Privacy update failed:", error);
            toast.error("Unable to update account privacy.");
        } finally {
            setSavingPrivacy(false);
        }
    };

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
                            className="peer sr-only"
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
                        <Icon path={mdiLockOutline} size={1} />
                        <span>{isPrivate ? "Private account" : "Public account"}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isPrivate}
                            disabled={savingPrivacy}
                            aria-label="Private account"
                            onChange={handlePrivacyChange}
                            className="peer sr-only"
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
                    <form onSubmit={handlePasswordChange} className="w-full space-y-3">
                        <input
                            type="password"
                            autoComplete="current-password"
                            placeholder="Current Password"
                            value={oldPassword}
                            onChange={(event) => setOldPassword(event.target.value)}
                            className="input"
                            required
                        />
                        <input
                            type="password"
                            autoComplete="new-password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            className="input"
                            required
                        />
                        <input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            className="input"
                            required
                        />
                        <button disabled={savingPassword} className="btn-primary self-start disabled:opacity-60">
                            {savingPassword ? "Updating..." : "Update Password"}
                        </button>
                    </form>
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
