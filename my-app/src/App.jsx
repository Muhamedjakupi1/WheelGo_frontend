import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import AdminTenants from "./pages/AdminTenants";
import TenantAdminDashboard from "./pages/TenantAdminDashboard";
import UserLayout from "./pages/user/UserLayout";
import TenantUserDashboard from "./pages/user/TenantUserDashboard";
import TenantUserBooking from "./pages/user/TenantUserBooking";
import TenantUserSettings from "./pages/user/TenantUserSettings";
import TenantUserProfile from "./pages/user/TenantUserPorfile";
import TenantUserSupport from "./pages/user/TenantUserSupport";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/login/:tenantSlug" element={<Login />} />
      <Route path="/signup/:tenantSlug" element={<SignUp />} />
      <Route path="/login" element={<Login/>}/>

      <Route
        path="/superadmin/tenants"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <AdminTenants />
          </ProtectedRoute>
        }
      />

      <Route
        path="/t/:tenantSlug/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <TenantAdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/t/:tenantSlug"
        element={
          <ProtectedRoute allowedRoles={["USER", "ADMIN", "SUPER_ADMIN"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="app" element={<TenantUserDashboard />} />
        <Route path="bookings" element={<TenantUserBooking />} />
        <Route path="settings" element={<TenantUserSettings />} />
        <Route path="profile" element={<TenantUserProfile />} />
        <Route path="support" element={<TenantUserSupport />} />
        <Route index element={<Navigate to="app" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
