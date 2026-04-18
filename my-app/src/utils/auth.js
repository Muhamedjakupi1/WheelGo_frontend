const KEY = "wheelgo_auth";

export const saveAuth    = (data) => localStorage.setItem(KEY, JSON.stringify(data));
export const getAuth     = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
export const getToken    = () => getAuth()?.token;
export const getRole     = () => getAuth()?.role;
export const getTenantSlug = () => getAuth()?.tenantSlug;
export const getUserId   = () => getAuth()?.userId;
export const isImpersonating = () => getAuth()?.isImpersonating === true;
export const clearAuth   = () => localStorage.removeItem(KEY);
export const isLoggedIn  = () => !!getToken();