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

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!userStr && !adminStr && !employeeStr) {
    localStorage.removeItem("token");
    return <Navigate to="/admin/login" replace />;
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

    // ✅ استفاده از isAdmin و isEmployee برای تعیین دسترسی‌های ویژه
    const isAdminUser = isAdmin;
    const isEmployeeUser = isEmployee;

    // لاگ برای دیباگ
    console.log(
      ` نقش: ${role}, ادمین: ${isAdminUser}, کارمند: ${isEmployeeUser}`,
    );

    // چک کردن allowedRoles
    if (allowedRoles && allowedRoles.length > 0) {
      // استفاده از isAdmin و isEmployee برای تعیین نقش
      let userRole = "USER";
      if (isAdminUser) userRole = "ADMIN";
      else if (isEmployeeUser) userRole = "EMPLOYEE";

      if (!allowedRoles.includes(userRole as any)) {
        console.warn(` دسترسی غیرمجاز: نقش ${userRole} مجاز نیست`);
        return <AccessDenied />;
      }
    }

    // چک کردن requiredRole
    if (requiredRole) {
      let hasRequiredRole = false;

      // استفاده از isAdmin و isEmployee برای چک کردن دسترسی
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
          ` دسترسی غیرمجاز: نقش ${role} برای ${requiredRole} لازم است`,
        );
        return <AccessDenied />;
      }
    }

    // استفاده از isAdmin و isEmployee برای نمایش اطلاعات در console
    const accessType = isAdminUser
      ? "ادمین"
      : isEmployeeUser
        ? "کارمند"
        : "کاربر عادی";
    console.log(` دسترسی مجاز برای ${accessType} با نقش ${role}`);

    return <>{children}</>;
  } catch (error) {
    console.error(" خطا در ProtectedRoute:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    localStorage.removeItem("employee");
    return <Navigate to="/admin/login" replace />;
  }
}
