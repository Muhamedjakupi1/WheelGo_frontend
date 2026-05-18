import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import AdminTenants from "./pages/AdminTenants";
import UserLayout from "./pages/user/UserLayout";
import TenantUserDashboard from "./pages/user/UserDashboard";
import TenantUserBooking from "./pages/user/UserBooking";
import TenantUserSettings from "./pages/user/UserSettings";
import TenantUserProfile from "./pages/user/UserPorfile";
import TenantUserSupport from "./pages/user/UserSupport";
import AdminLayout from "./pages/admin/AdminLayout";
import TenantAdminDashboard from "./pages/admin/TenantAdminDashboard";
import TenantAdminLocations from "./pages/admin/TenantAdminLocations";
import TenantAdminVehicles from "./pages/admin/TenantAdminVehicles";
import TenantAdminVehicleCategories from "./pages/admin/TenantAdminVehicleCategories";
import TenantAdminVehicleImages from "./pages/admin/TenantAdminVehicleImages";
import TenantAdminUsers from "./pages/admin/TenantAdminUsers";
import TenantAdminBookings from "./pages/admin/TenantAdminBookings";
import TenantAdminAddons from "./pages/admin/TenantAdminAddons";
import TenantAdminMaintenance from "./pages/admin/TenantAdminMaintenance";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/login/:tenantSlug" element={<Login />} />
      <Route path="/signup/:tenantSlug" element={<SignUp />} />

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
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TenantAdminDashboard />} />
        <Route path="locations" element={<TenantAdminLocations />} />
        <Route path="vehicles" element={<TenantAdminVehicles />} />
        <Route path="vehicle-categories" element={<TenantAdminVehicleCategories />} />
        <Route path="vehicle-images" element={<TenantAdminVehicleImages />} />
        <Route path="users" element={<TenantAdminUsers />} />
        <Route path="bookings" element={<TenantAdminBookings />} />
        <Route path="addons" element={<TenantAdminAddons />} />
        <Route path="maintenance" element={<TenantAdminMaintenance />} />
      </Route>

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

