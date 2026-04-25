import { createContext, useContext, useState } from "react";
import { saveAuth, getAuth, clearAuth } from "../utils/auth";
import { login, signupTenant } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getAuth());

  const signIn = async (tenantSlug, email, password) => {
    const { data } = await login(tenantSlug, email, password);
    localStorage.setItem("last_tenant_slug", tenantSlug)
    saveAuth(data);
    setUser(data);
    return data;
  };

  const signup = async (tenantSlug, email, password) => {
    const { data } = await signupTenant(tenantSlug, email, password);
    saveAuth(data);
    setUser(data);
    return data;
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
    saveAuth(data);
    setUser(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        signIn,
        signup,
        updateAuth,
        isLoggedIn: !!user,
        isSuperAdmin: user?.role === "SUPER_ADMIN",
        isAdmin: user?.role === "ADMIN",
        isCustomer: user?.role === "CUSTOMER",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);