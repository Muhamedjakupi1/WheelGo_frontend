import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SUPER_ADMIN_LOGIN_PATH = "/login/super-admin-tenant";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const { tenantSlug } = useParams();
  const isSuperAdminOnlyRoute =
    Array.isArray(allowedRoles) &&
    allowedRoles.length === 1 &&
    allowedRoles[0] === "SUPER_ADMIN";
  const isSuperAdminImpersonating =
    user?.isImpersonating === true && user?.originalRole === "SUPER_ADMIN";

  if (!user) {
    return <Navigate to={isSuperAdminOnlyRoute ? SUPER_ADMIN_LOGIN_PATH : "/login"} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (isSuperAdminOnlyRoute && isSuperAdminImpersonating && user.tenantSlug) {
      return <Navigate to={`/t/${user.tenantSlug}/admin`} replace />;
    }
    return <Navigate to={isSuperAdminOnlyRoute ? SUPER_ADMIN_LOGIN_PATH : "/login"} replace />;
  }

  if (tenantSlug && user.role !== "SUPER_ADMIN") {
    if (user.tenantSlug !== tenantSlug) {
      return <Navigate to={`/login/${tenantSlug}`} replace />;
    }
  }

  return children;
}
