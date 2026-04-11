import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin   from "./pages/AdminLogin";
import AdminTenants from "./pages/AdminTenants";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/tenants"
          element={
            <ProtectedRoute>
              <AdminTenants />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}