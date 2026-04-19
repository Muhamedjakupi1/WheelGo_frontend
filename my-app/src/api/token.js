export const saveAuth = (token, role, email) => { 
  localStorage.setItem("jwt", token);
  localStorage.setItem("role", role);
  localStorage.setItem("email", email); 
};

export const getToken   = () => localStorage.getItem("jwt");
export const getRole    = () => localStorage.getItem("role");
export const getEmail   = () => localStorage.getItem("email");
export const removeAuth = () => {
  localStorage.removeItem("jwt");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
};
export const isLoggedIn = () => !!getToken();