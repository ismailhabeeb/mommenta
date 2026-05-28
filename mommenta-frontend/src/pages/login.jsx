import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Icon from "@mdi/react";
import { mdiAccount, mdiLock, mdiEye, mdiEyeOff } from "@mdi/js";
import LogoAnimated from "../components/Logo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(formData);
      console.log("Login success:", res);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo + Branding */}
        <div className="flex flex-col items-center mb-8">
          <LogoAnimated size={64} strokeWidth={16} />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-3 tracking-tight">
            Mommenta
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 font-light">
            Welcome back, sign in to continue
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 dark:text-red-400 px-4 py-3 rounded-xl border border-red-100 dark:border-red-500/20 text-center">
            {error}
          </div>
        )}

        {/* Card */}
        <div className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Email
              </label>
              <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-xl px-3 gap-2">
                <Icon path={mdiAccount} size={0.8} className="text-gray-300 dark:text-white/30 shrink-0" />
                <div className="w-px h-4 bg-gray-200 dark:bg-white/10 shrink-0" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="flex-1 py-3 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-white/20"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Password
                </label>
                <span className="text-xs text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  Forgot password?
                </span>
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-xl px-3 gap-2 relative">
                <Icon path={mdiLock} size={0.8} className="text-gray-300 dark:text-white/30 shrink-0" />
                <div className="w-px h-4 bg-gray-200 dark:bg-white/10 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  className="flex-1 py-3 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-white/20 pr-10"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-300 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60 transition-colors"
                >
                  <Icon path={showPassword ? mdiEyeOff : mdiEye} size={0.8} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity mt-1"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

          </form>
        </div>

        {/* Signup link */}
        <p className="text-sm text-center text-gray-400 dark:text-gray-500 mt-5 font-light">
          Don't have an account?{" "}
          <a href="/signup" className="font-semibold text-gray-900 dark:text-white underline">
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
}