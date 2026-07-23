// src/components/auth/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import AccessDenied from "../../pages/AccessDenied";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "SUPER_ADMIN";
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const adminStr = localStorage.getItem("admin");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!userStr && !adminStr) {
    localStorage.removeItem("token");
    return <Navigate to="/admin/login" replace />;
  }

  try {
    let user = null;
    let isAdmin = false;
    let role = "";

    if (adminStr) {
      user = JSON.parse(adminStr);
      isAdmin = true;
      role = user.role || "ADMIN";
    } else if (userStr) {
      user = JSON.parse(userStr);
      isAdmin = false;
      role = user.role || "USER";
    }

    if (!isAdmin) {
      return <AccessDenied />;
    }

    if (requiredRole && role !== requiredRole) {
      return <AccessDenied />;
    }

    return <>{children}</>;
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    return <Navigate to="/admin/login" replace />;
  }
}
