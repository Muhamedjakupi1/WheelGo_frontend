const KEY = "wheelgo_auth";

const migrateLegacyAuth = () => {
    const legacyValue = localStorage.getItem(KEY);
    if (legacyValue && !sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, legacyValue);
    }
    localStorage.removeItem(KEY);
};

export const saveAuth    = (data) => sessionStorage.setItem(KEY, JSON.stringify(data));
export const getAuth     = () => {
    migrateLegacyAuth();
    try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; }
};
export const getToken    = () => getAuth()?.token;
export const getRole     = () => getAuth()?.role;
export const getTenantSlug = () => getAuth()?.tenantSlug;
export const getUserId   = () => getAuth()?.userId;
export const isImpersonating = () => getAuth()?.isImpersonating === true;
export const isLoggedIn  = () => !!getToken();
export const getTenantSlugBeforeLogout = () => {
    const auth = getAuth();
    return auth ? auth.tenantSlug : null
};
export const clearAuth   = () => {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
};
