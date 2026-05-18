const KEY = "wheelgo_auth";

export const normalizeAuth = (data) => {
    if (!data || typeof data !== "object") {
        return data ?? null;
    }

    const isImpersonating =
        data.isImpersonating === true ||
        data.impersonating === true;

    return {
        ...data,
        isImpersonating,
        originalRole: data.originalRole ?? null,
        originalUserId: data.originalUserId ?? null,
    };
};

const migrateLegacyAuth = () => {
    const legacyValue = localStorage.getItem(KEY);
    if (legacyValue && !sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, legacyValue);
    }
    localStorage.removeItem(KEY);
};

export const saveAuth    = (data) => sessionStorage.setItem(KEY, JSON.stringify(normalizeAuth(data)));
export const getAuth     = () => {
    migrateLegacyAuth();
    try { return normalizeAuth(JSON.parse(sessionStorage.getItem(KEY))); } catch { return null; }
};
export const getToken    = () => getAuth()?.token;
export const getRole     = () => getAuth()?.role;
export const getTenantSlug = () => getAuth()?.tenantSlug;
export const getUserId   = () => getAuth()?.userId;
export const isImpersonating = () => getAuth()?.isImpersonating === true;
export const isSuperAdminImpersonating = () => {
    const auth = getAuth();
    return auth?.isImpersonating === true && auth?.originalRole === "SUPER_ADMIN";
};
export const isLoggedIn  = () => !!getToken();
export const getTenantSlugBeforeLogout = () => {
    const auth = getAuth();
    return auth ? auth.tenantSlug : null
};
export const clearAuth   = () => {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
};
