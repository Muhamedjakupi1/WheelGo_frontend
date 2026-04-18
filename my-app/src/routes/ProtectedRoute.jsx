import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const { tenantSlug } = useParams();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  if (tenantSlug && user.role !== "SUPER_ADMIN") {
    if (user.tenantSlug !== tenantSlug) {
      return <Navigate to={`/login/${tenantSlug}`} replace />;
    }
  }

  return children;
}