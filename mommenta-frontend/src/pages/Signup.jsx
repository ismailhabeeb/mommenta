import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Icon from "@mdi/react";
import { mdiAccount, mdiEmail, mdiLock, mdiEye, mdiEyeOff } from "@mdi/js";
import LogoAnimated from "../components/Logo";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthColors = ["#E24B4A", "#EF9F27", "#1D9E75", "#534AB7"];
  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signup({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      navigate("/home");
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Signup failed"
      );
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
            Create your account to get started
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

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Username
              </label>
              <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-xl px-3 gap-2">
                <Icon path={mdiAccount} size={0.8} className="text-gray-300 dark:text-white/30 shrink-0" />
                <div className="w-px h-4 bg-gray-200 dark:bg-white/10 shrink-0" />
                <input
                  type="text"
                  name="username"
                  placeholder="@yourname"
                  className="flex-1 py-3 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-white/20"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Email
              </label>
              <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-xl px-3 gap-2">
                <Icon path={mdiEmail} size={0.8} className="text-gray-300 dark:text-white/30 shrink-0" />
                <div className="w-px h-4 bg-gray-200 dark:bg-white/10 shrink-0" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="flex-1 py-3 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-white/20"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-xl px-3 gap-2 relative">
                <Icon path={mdiLock} size={0.8} className="text-gray-300 dark:text-white/30 shrink-0" />
                <div className="w-px h-4 bg-gray-200 dark:bg-white/10 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min. 6 characters"
                  className="flex-1 py-3 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-white/20 pr-10"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 text-gray-300 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60 transition-colors"
                >
                  <Icon path={showPassword ? mdiEyeOff : mdiEye} size={0.8} />
                </button>
              </div>
              {/* Strength bars */}
              {form.password.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-0.5 rounded-full transition-all duration-300"
                      style={{ background: i < strength ? strengthColors[strength - 1] : '#e5e7eb' }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Confirm Password
              </label>
              <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-xl px-3 gap-2">
                <Icon path={mdiLock} size={0.8} className="text-gray-300 dark:text-white/30 shrink-0" />
                <div className="w-px h-4 bg-gray-200 dark:bg-white/10 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Repeat password"
                  className="flex-1 py-3 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-white/20"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity mt-1"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

          </form>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-300 dark:text-gray-600 text-center mt-4 leading-relaxed">
          By signing up you agree to our{" "}
          <span className="underline text-gray-400 dark:text-gray-500 cursor-pointer">Terms</span>{" "}
          and{" "}
          <span className="underline text-gray-400 dark:text-gray-500 cursor-pointer">Privacy Policy</span>.
        </p>

        {/* Login link */}
        <p className="text-sm text-center text-gray-400 dark:text-gray-500 mt-4 font-light">
          Already have an account?{" "} 
          <Link to="/login" className="font-semibold text-gray-900 dark:text-white underline">
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}