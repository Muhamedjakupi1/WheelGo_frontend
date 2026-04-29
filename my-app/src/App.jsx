App.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import TenantSignup from "./pages/TenantSignup";
import AdminTenants from "./pages/AdminTenants";
import TenantAdminDashboard from "./pages/TenantAdminDashboard";

import UserLayout from "./pages/user/UserLayout"; 
import TenantUserDashboard from "./pages/user/TenantUserDashboard";


export default function App() {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/signup/:tenantSlug" element={<TenantSignup />} />


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
        
        <Route index element={<Navigate to="app" replace />} />
      </Route>


      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
