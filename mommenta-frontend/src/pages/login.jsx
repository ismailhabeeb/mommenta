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
    <div className="flex flex-col items-center justify-center min-h-screen 
      bg-gradient-to-br from-brand-gradientStart to-brand-gradientEnd 
      px-6 py-10 text-white">

      {/* Logo + Title */}
      <div className="flex flex-col items-center mb-10">
        <LogoAnimated size={120} strokeWidth={20} className="mb-3" />
        <h1 className="text-3xl sm:text-4xl font-heading font-bold">
          Welcome Back 👋
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 text-sm text-red-200 bg-red-500/20 px-3 py-2 rounded-lg w-full max-w-sm text-center">
          {error}
        </div>
      )}

      {/* Form */}
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-sm space-y-4 bg-white/10 backdrop-blur-md 
        p-6 rounded-2xl shadow-lg border border-white/20 "
      >

        {/* Email */}
        <div className="flex items-center bg-white/20 rounded-lg px-3 outline-none">
          <Icon path={mdiAccount} size={1} className="text-white/70" />
          <input
            type="email"
            name="email"
            className="flex-1 p-2 bg-transparent outline-none border-none text-white placeholder-white/70"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div className="flex items-center bg-white/20 rounded-lg px-3 relative">
          <Icon path={mdiLock} size={1} className="text-white/70" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            className="flex-1 p-2 bg-transparent outline-none border-none text-white placeholder-white/70 pr-10"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="absolute right-2 text-white/70 hover:text-white"
            onClick={() => setShowPassword(!showPassword)}
          >
            <Icon path={showPassword ? mdiEyeOff : mdiEye} size={1} />
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 rounded-xl font-medium"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Signup Link */}
      <p className="mt-4 text-sm text-white/80">
        Don’t have an account?{" "}
        <a href="/signup" className="text-white font-semibold underline">
          Sign up
        </a>
      </p>
    </div>
  );
}
