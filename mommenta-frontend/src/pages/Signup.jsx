// src/pages/Signup.jsx
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-gradientStart to-brand-gradientEnd p-4">

      <div className="w-full max-w-md space-y-6">

        {/* Logo + Branding */}
        <div className="flex flex-col items-center mb-2">
          <LogoAnimated size={120} stroke={16} />
          <h1 className="text-3xl font-heading font-bold text-white mt-3">
            Mommenta
          </h1>
        </div>

        <h2 className="text-xl font-semibold text-center text-white/90">
          Create your account
        </h2>

        {error && (
          <div className="mb-2 text-sm text-red-500 bg-red-100 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 bg-white/10 backdrop-blur-md 
        p-6 rounded-2xl ">

          {/* Username */}
          <div className="flex items-center border border-white/30 bg-white/10 backdrop-blur-md rounded-lg px-3">
            <Icon path={mdiAccount} size={1} className="text-white/70" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="flex-1 p-2 outline-none bg-transparent text-white placeholder-white/60"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="flex items-center border border-white/30 bg-white/10 backdrop-blur-md rounded-lg px-3">
            <Icon path={mdiEmail} size={1} className="text-white/70" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="flex-1 p-2 outline-none bg-transparent text-white placeholder-white/60"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center border border-white/30 bg-white/10 backdrop-blur-md rounded-lg px-3 relative">
            <Icon path={mdiLock} size={1} className="text-white/70" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="flex-1 p-2 outline-none bg-transparent text-white placeholder-white/60 pr-8"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-2 text-white/70"
              onClick={() => setShowPassword((s) => !s)}
            >
              <Icon path={showPassword ? mdiEyeOff : mdiEye} size={1} />
            </button>
          </div>

          {/* Confirm Password */}
          <div className="flex items-center border border-white/30 bg-white/10 backdrop-blur-md rounded-lg px-3">
            <Icon path={mdiLock} size={1} className="text-white/70" />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              className="flex-1 p-2 outline-none bg-transparent text-white placeholder-white/60"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>

        </form>

        <p className="text-sm text-center text-white/80 mt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-white font-semibold underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
