// src/pages/Signup.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Icon from "@mdi/react";
import { mdiAccount, mdiEmail, mdiLock, mdiEye, mdiEyeOff } from "@mdi/js";

export default function Signup() {
  const { signup } = useAuth();            // context handles token/user storage
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      // call context signup — it should save token and user for you
      await signup({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      // navigate to protected area
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-heading font-bold text-center text-gray-800 dark:text-white mb-6">
          Create your account
        </h1>

        {error && <div className="mb-4 text-sm text-red-500 bg-red-100 px-3 py-2 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center border rounded-lg px-3">
            <Icon path={mdiAccount} size={1} className="text-gray-400" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="flex-1 p-2 outline-none bg-transparent"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center border rounded-lg px-3">
            <Icon path={mdiEmail} size={1} className="text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="flex-1 p-2 outline-none bg-transparent"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center border rounded-lg px-3 relative">
            <Icon path={mdiLock} size={1} className="text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="flex-1 p-2 outline-none bg-transparent pr-8"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword((s) => !s)}
            >
              <Icon path={showPassword ? mdiEyeOff : mdiEye} size={1} />
            </button>
          </div>

          <div className="flex items-center border rounded-lg px-3">
            <Icon path={mdiLock} size={0.9} className="text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm password"
              className="flex-1 p-2 outline-none bg-transparent"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-brand font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
