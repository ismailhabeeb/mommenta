      // ProtectedRoute//
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SkeletonLoader from "./SkeletonLoader";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // After preload → show skeleton while fetching session
  if (loading) {
    return <h1>Fetching User Data .......</h1>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
