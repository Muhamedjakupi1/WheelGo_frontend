import { createContext, useContext, useState } from "react";
import { saveAuth, getAuth, clearAuth } from "../utils/auth";
import { login, signupTenant } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getAuth());

  const signIn = async (email, password) => {
    const { data } = await login(email, password);
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
    clearAuth();
    setUser(null);
    window.location.href = "/login";
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