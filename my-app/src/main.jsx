import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TenantSettingsProvider } from "./context/TenantSettingsContext";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TenantSettingsProvider>
          <App />
        </TenantSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
