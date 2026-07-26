// src/components/auth/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import AccessDenied from "../../pages/AccessDenied";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "SUPER_ADMIN" | "EMPLOYEE" | "MANAGER";
  allowedRoles?: ("ADMIN" | "EMPLOYEE" | "MANAGER")[];
}

export function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const adminStr = localStorage.getItem("admin");
  const employeeStr = localStorage.getItem("employee");

  // 🔥 اگر توکن نباشه
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // 🔥 اگر هیچ کاربری ذخیره نشده
  if (!userStr && !adminStr && !employeeStr) {
    localStorage.removeItem("token");
    return <Navigate to="/admin/login" replace />;
  }

  try {
    // 🔥 تشخیص کاربر
    let user = null;
    let isAdmin = false;
    let isEmployee = false;
    let role = "";

    if (adminStr) {
      user = JSON.parse(adminStr);
      isAdmin = true;
      role = user.role || "ADMIN";
    } else if (employeeStr) {
      user = JSON.parse(employeeStr);
      isEmployee = true;
      role = user.role || "EMPLOYEE";
    } else if (userStr) {
      user = JSON.parse(userStr);
      isAdmin = user.role === "ADMIN" || user.type === "admin";
      isEmployee = user.type === "employee" || user.role === "EMPLOYEE";
      role = user.role || "USER";
    }

    // 🔥 اگر allowedRoles مشخص شده، چک کن
    if (allowedRoles && allowedRoles.length > 0) {
      let userRole = "USER";
      if (isAdmin) userRole = "ADMIN";
      else if (isEmployee) userRole = "EMPLOYEE";

      if (!allowedRoles.includes(userRole as any)) {
        return <AccessDenied />;
      }
    }

    // 🔥 اگر requiredRole مشخص شده
    if (requiredRole) {
      if (isAdmin && requiredRole === "ADMIN") {
        return <>{children}</>;
      }
      if (
        isEmployee &&
        (requiredRole === "EMPLOYEE" || requiredRole === "MANAGER")
      ) {
        return <>{children}</>;
      }
      return <AccessDenied />;
    }

    // 🔥 اگر هیچ نقشی مشخص نشده، هر کاربر لاگین شده دسترسی داره
    return <>{children}</>;
  } catch (error) {
    console.error("❌ خطا در ProtectedRoute:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    localStorage.removeItem("employee");
    return <Navigate to="/admin/login" replace />;
  }
}
