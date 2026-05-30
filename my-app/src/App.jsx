import React, { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import AdminTenants from "./pages/AdminTenants";
import UserLayout from "./pages/user/UserLayout";
import TenantUserDashboard from "./pages/user/UserDashboard";
import TenantUserBooking from "./pages/user/UserBooking";
import TenantUserPayments from "./pages/user/UserPayments";
import TenantUserSettings from "./pages/user/UserSettings";
import TenantUserProfile from "./pages/user/UserProfile";
import TenantUserSupport from "./pages/user/UserSupport";
import TenantUserReviews from "./pages/user/UserReviews";
import AdminLayout from "./pages/admin/AdminLayout";
import TenantAdminDashboard from "./pages/admin/TenantAdminDashboard";
import TenantAdminLocations from "./pages/admin/TenantAdminLocations";
import TenantAdminVehicles from "./pages/admin/TenantAdminVehicles";
import TenantAdminVehicleCategories from "./pages/admin/TenantAdminVehicleCategories";
import TenantAdminVehicleImages from "./pages/admin/TenantAdminVehicleImages";
import TenantAdminUsers from "./pages/admin/TenantAdminUsers";
import TenantAdminBookings from "./pages/admin/TenantAdminBookings";
import TenantAdminPayments from "./pages/admin/TenantAdminPayments";
import TenantAdminAddons from "./pages/admin/TenantAdminAddons";
import TenantAdminPromotions from "./pages/admin/TenantAdminPromotions";
import TenantAdminMaintenance from "./pages/admin/TenantAdminMaintenance";
import TenantAdminSupport from "./pages/admin/TenantAdminSupport";
import TenantAdminReviews from "./pages/admin/TenantAdminReviews";

const APP_NAME = "WheelGo";

const TITLE_PATTERNS = [
  { pattern: /^\/login(?:\/[^/]+)?$/, title: "Login" },
  { pattern: /^\/signup\/[^/]+$/, title: "Sign Up" },
  { pattern: /^\/superadmin\/tenants$/, title: "Super Admin Tenants" },
  { pattern: /^\/t\/[^/]+\/admin$/, title: "Admin Dashboard" },
  { pattern: /^\/t\/[^/]+\/admin\/locations$/, title: "Locations" },
  { pattern: /^\/t\/[^/]+\/admin\/vehicles$/, title: "Vehicles" },
  { pattern: /^\/t\/[^/]+\/admin\/vehicle-categories$/, title: "Vehicle Categories" },
  { pattern: /^\/t\/[^/]+\/admin\/vehicle-images$/, title: "Vehicle Images" },
  { pattern: /^\/t\/[^/]+\/admin\/users$/, title: "Users" },
  { pattern: /^\/t\/[^/]+\/admin\/bookings$/, title: "Bookings" },
  { pattern: /^\/t\/[^/]+\/admin\/reviews$/, title: "Reviews" },
  { pattern: /^\/t\/[^/]+\/admin\/payments$/, title: "Payments" },
  { pattern: /^\/t\/[^/]+\/admin\/promotions$/, title: "Promotions" },
  { pattern: /^\/t\/[^/]+\/admin\/addons$/, title: "Add-ons" },
  { pattern: /^\/t\/[^/]+\/admin\/maintenance$/, title: "Maintenance" },
  { pattern: /^\/t\/[^/]+\/admin\/support$/, title: "Support" },
  { pattern: /^\/t\/[^/]+\/app$/, title: "HomePage" },
  { pattern: /^\/t\/[^/]+\/bookings$/, title: "My Booking" },
  { pattern: /^\/t\/[^/]+\/reviews$/, title: "Reviews" },
  { pattern: /^\/t\/[^/]+\/payments$/, title: "Payments" },
  { pattern: /^\/t\/[^/]+\/settings$/, title: "Settings" },
  { pattern: /^\/t\/[^/]+\/profile$/, title: "Profile" },
  { pattern: /^\/t\/[^/]+\/support$/, title: "Support" },
  { pattern: /^\/t\/[^/]+$/, title: "HomePage" },
];

function getPageTitle(pathname) {
  const matched = TITLE_PATTERNS.find(({ pattern }) => pattern.test(pathname));
  return matched ? `${matched.title} | ${APP_NAME}` : APP_NAME;
}

function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = getPageTitle(pathname);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <DocumentTitle />
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
          <Route path="reviews" element={<TenantAdminReviews />} />
          <Route path="payments" element={<TenantAdminPayments />} />
          <Route path="promotions" element={<TenantAdminPromotions />} />
          <Route path="addons" element={<TenantAdminAddons />} />
          <Route path="maintenance" element={<TenantAdminMaintenance />} />
          <Route path="support" element={<TenantAdminSupport />} />
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
          <Route path="reviews" element={<TenantUserReviews />} />
          <Route path="payments" element={<TenantUserPayments />} />
          <Route path="settings" element={<TenantUserSettings />} />
          <Route path="profile" element={<TenantUserProfile />} />
          <Route path="support" element={<TenantUserSupport />} />
          <Route index element={<Navigate to="app" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
