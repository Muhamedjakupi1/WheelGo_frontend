import { createContext, useContext, useState } from "react";
import { saveAuth, getAuth, clearAuth, getTenantSlug, normalizeAuth } from "../utils/auth";
import { login, signupTenant } from "../api/authApi";
import { startImpersonation as startImpersonationRequest, stopImpersonation as stopImpersonationRequest } from "../api/tenantApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getAuth());

  const signIn = async (tenantSlug, email, password) => {
    const { data } = await login(tenantSlug, email, password);
    const normalized = normalizeAuth(data);
    localStorage.setItem("last_tenant_slug", tenantSlug)
    saveAuth(normalized);
    setUser(normalized);
    return normalized;
  };

  const signup = async (tenantSlug, signupData) => {
    const { data } = await signupTenant(tenantSlug, signupData);
    const normalized = normalizeAuth(data);
    localStorage.setItem("last_tenant_slug", tenantSlug)
    saveAuth(normalized);
    setUser(normalized);
    return normalized;
  };

  const logout = () => {
    const slug = user?.tenantSlug || getTenantSlug();
    clearAuth();
    setUser(null);
    if(slug){
    window.location.href = `/login/${slug}`;
    }else{
      window.location.href = "/login";
    }
  };

  const updateAuth = (data) => {
    const normalized = normalizeAuth(data);
    saveAuth(normalized);
    setUser(normalized);
  };

  const startImpersonation = async (tenantSlug) => {
    const { data } = await startImpersonationRequest(tenantSlug);
    const normalized = normalizeAuth(data);
    saveAuth(normalized);
    setUser(normalized);
    return normalized;
  };

  const stopImpersonation = async () => {
    const { data } = await stopImpersonationRequest();
    const normalized = normalizeAuth(data);
    saveAuth(normalized);
    setUser(normalized);
    return normalized;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        signIn,
        signup,
        updateAuth,
        startImpersonation,
        stopImpersonation,
        isLoggedIn: !!user,
        isSuperAdmin: user?.role === "SUPER_ADMIN",
        isAdmin: user?.role === "ADMIN",
        isCustomer: user?.role === "CUSTOMER",
        isImpersonating: user?.isImpersonating === true,
        isSuperAdminImpersonating:
          user?.isImpersonating === true && user?.originalRole === "SUPER_ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
