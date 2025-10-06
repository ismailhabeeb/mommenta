import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Icon from "@mdi/react";
import { mdiAccount, mdiLock, mdiEye, mdiEyeOff } from "@mdi/js";

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
      navigate("/"); // 👈 redirect after login success
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-heading font-bold text-center text-gray-800 dark:text-white mb-6">
          Welcome Back 👋
        </h1>

        {error && (
          <div className="mb-4 text-sm text-red-500 bg-red-100 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="flex items-center border rounded-lg px-3">
            <Icon path={mdiAccount} size={1} className="text-gray-400" />
            <input
              type="email"
              name="email"
              className="flex-1 p-2 outline-none bg-transparent"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center border rounded-lg px-3 relative">
            <Icon path={mdiLock} size={1} className="text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="flex-1 p-2 outline-none bg-transparent pr-8"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              <Icon path={showPassword ? mdiEyeOff : mdiEye} size={1} />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
          Don’t have an account?{" "}
          <a href="/signup" className="text-brand font-medium hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
