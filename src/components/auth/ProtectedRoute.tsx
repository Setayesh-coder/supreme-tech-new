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

  // ✅ اصلاح: اگر توکن نداره، به لاگین عمومی بره (نه ادمین)
  if (!token) {
    // بررسی کنیم که آیا کاربر در مسیر ادمین هست یا نه
    const isAdminPath = window.location.pathname.startsWith("/admin");

    if (isAdminPath) {
      return <Navigate to="/admin/login" replace />;
    }

    // ✅ مسیرهای عمومی به login معمولی
    return <Navigate to="/login" replace />;
  }

  // ✅ اگر توکن داره ولی اطلاعات کاربر وجود نداره
  if (!userStr && !adminStr && !employeeStr) {
    localStorage.removeItem("token");

    // بررسی مسیر ادمین
    const isAdminPath = window.location.pathname.startsWith("/admin");
    if (isAdminPath) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  try {
    let role = "USER";
    let isAdmin = false;
    let isEmployee = false;

    if (adminStr) {
      const user = JSON.parse(adminStr);
      isAdmin = true;
      role = user.role || "ADMIN";
    } else if (employeeStr) {
      const user = JSON.parse(employeeStr);
      isEmployee = true;
      role = user.role || "EMPLOYEE";
    } else if (userStr) {
      const user = JSON.parse(userStr);
      isAdmin = user.role === "ADMIN" || user.type === "admin";
      isEmployee = user.type === "employee" || user.role === "EMPLOYEE";
      role = user.role || "USER";
    }

    const isAdminUser = isAdmin;
    const isEmployeeUser = isEmployee;

    // چک کردن allowedRoles
    if (allowedRoles && allowedRoles.length > 0) {
      let userRole = "USER";
      if (isAdminUser) userRole = "ADMIN";
      else if (isEmployeeUser) userRole = "EMPLOYEE";

      if (!allowedRoles.includes(userRole as any)) {
        console.warn(`⚠️ دسترسی غیرمجاز: نقش ${userRole} مجاز نیست`);
        return <AccessDenied />;
      }
    }

    // چک کردن requiredRole
    if (requiredRole) {
      let hasRequiredRole = false;

      if (requiredRole === "ADMIN" && isAdminUser) {
        hasRequiredRole = true;
      } else if (requiredRole === "EMPLOYEE" && isEmployeeUser) {
        hasRequiredRole = true;
      } else if (
        requiredRole === "MANAGER" &&
        (isAdminUser || isEmployeeUser)
      ) {
        hasRequiredRole = true;
      } else if (requiredRole === "SUPER_ADMIN" && isAdminUser) {
        hasRequiredRole = true;
      }

      if (!hasRequiredRole) {
        console.warn(
          `⚠️ دسترسی غیرمجاز: نقش ${role} برای ${requiredRole} لازم است`,
        );
        return <AccessDenied />;
      }
    }

    return <>{children}</>;
  } catch (error) {
    console.error("❌ خطا در ProtectedRoute:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    localStorage.removeItem("employee");

    // بررسی مسیر ادمین
    const isAdminPath = window.location.pathname.startsWith("/admin");
    if (isAdminPath) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }
}
