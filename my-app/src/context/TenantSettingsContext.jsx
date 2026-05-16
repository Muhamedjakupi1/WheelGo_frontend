import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentTenantSettings } from "../api/tenantSettingsApi";
import { useAuth } from "./AuthContext";
import { resolveCurrencySettings } from "../utils/currency";

const TenantSettingsContext = createContext({
  settings: resolveCurrencySettings(),
  loading: false,
  refreshSettings: async () => {},
});

export function TenantSettingsProvider({ children }) {
  const { user, isLoggedIn, isSuperAdmin } = useAuth();
  const [settings, setSettings] = useState(resolveCurrencySettings());
  const [loading, setLoading] = useState(false);

  const refreshSettings = async () => {
    if (!isLoggedIn || isSuperAdmin || !user?.tenantSlug) {
      setSettings(resolveCurrencySettings());
      return;
    }

    try {
      setLoading(true);
      const { data } = await getCurrentTenantSettings();
      setSettings(resolveCurrencySettings(data));
    } catch {
      setSettings(resolveCurrencySettings());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, [isLoggedIn, isSuperAdmin, user?.tenantSlug]);

  const value = useMemo(
    () => ({
      settings,
      loading,
      refreshSettings,
    }),
    [settings, loading]
  );

  return (
    <TenantSettingsContext.Provider value={value}>
      {children}
    </TenantSettingsContext.Provider>
  );
}

export const useTenantSettings = () => useContext(TenantSettingsContext);
