// src/components/admin/AdminLayout.tsx
import { type ReactNode, useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../../lib/api/auth";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Building2,
  User,
  Mail,
  Ticket,
  UserCog,
  HelpCircle,
  Image,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // 🔥 دریافت اطلاعات کاربر - فقط یک بار
  const userStr = localStorage.getItem("user");
  const adminStr = localStorage.getItem("admin");
  const employeeStr = localStorage.getItem("employee");

  const user = useMemo(() => {
    if (userStr) return JSON.parse(userStr);
    if (adminStr) return JSON.parse(adminStr);
    if (employeeStr) return JSON.parse(employeeStr);
    return null;
  }, [userStr, adminStr, employeeStr]);

  // 🔥 تشخیص نقش - با useMemo برای جلوگیری از رندر مجدد
  const { isAdmin, isEmployee } = useMemo(() => {
    const admin =
      user?.role === "ADMIN" || user?.type === "admin" || adminStr !== null;
    const employee =
      user?.type === "employee" ||
      user?.role === "EMPLOYEE" ||
      employeeStr !== null;
    return { isAdmin: admin, isEmployee: employee };
  }, [user, adminStr, employeeStr]);

  // 🔥 بررسی دسترسی - فقط یک بار با useEffect خالی
  useEffect(() => {
    if (!user) {
      navigate("/access-denied", { replace: true });
      setIsAuthenticated(false);
    } else if (!isAdmin && !isEmployee) {
      navigate("/access-denied", { replace: true });
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []); // ✅ آرایه خالی - فقط یک بار اجرا میشه

  if (!isAuthenticated || !user || (!isAdmin && !isEmployee)) {
    return null;
  }

  const handleLogout = () => {
    if (confirm("آیا از خروج از حساب کاربری مطمئن هستید؟")) {
      authAPI.logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("admin");
      localStorage.removeItem("employee");
      navigate("/admin/login");
    }
  };

  // ============================================================
  // 🔥 منوی اصلی - با useMemo برای جلوگیری از رندر مجدد
  // ============================================================
  const menuItems = useMemo(() => {
    const items = [
      {
        icon: <LayoutDashboard size={20} />,
        label: "داشبورد",
        path: "/admin/dashboard",
        roles: ["ADMIN", "EMPLOYEE", "MANAGER"],
      },
      {
        icon: <FileText size={20} />,
        label: "بلاگ",
        path: "/admin/blog",
        roles: ["ADMIN"],
      },
      {
        icon: <Calendar size={20} />,
        label: "رویدادها",
        path: "/admin/events",
        roles: ["ADMIN", "EMPLOYEE", "MANAGER"],
      },
      {
        icon: <Image size={20} />,
        label: "اسلایدها",
        path: "/admin/hero",
        roles: ["ADMIN"],
      },
      {
        icon: <Users size={20} />,
        label: "کاربران",
        path: "/admin/users",
        roles: ["ADMIN"],
      },
      {
        icon: <UserCog size={20} />,
        label: "کارمندان",
        path: "/admin/employees",
        roles: ["ADMIN"],
      },
      {
        icon: <Building2 size={20} />,
        label: "همکاران",
        path: "/admin/partners",
        roles: ["ADMIN"],
      },
      {
        icon: <Ticket size={20} />,
        label: "تیکت‌ها",
        path: "/admin/tickets",
        roles: ["ADMIN", "EMPLOYEE", "MANAGER"],
      },
      {
        icon: <Mail size={20} />,
        label: "پیام‌ها",
        path: "/admin/messages",
        roles: ["ADMIN"],
      },
      {
        icon: <HelpCircle size={20} />,
        label: "راهنما",
        path: "/admin/help",
        roles: ["ADMIN"],
      },
      {
        icon: <User size={20} />,
        label: "پروفایل",
        path: "/profile",
        roles: ["ADMIN", "EMPLOYEE", "MANAGER"],
      },
      {
        icon: <Settings size={20} />,
        label: "تنظیمات",
        path: "/admin/settings",
        roles: ["ADMIN"],
      },
    ];
    return items;
  }, []);

  // ============================================================
  // 🔥 فیلتر منو بر اساس نقش
  // ============================================================
  const getUserRole = () => {
    if (isAdmin) return "ADMIN";
    if (isEmployee) return "EMPLOYEE";
    return "USER";
  };

  const filteredMenuItems = menuItems.filter((item) => {
    return item.roles.includes(getUserRole());
  });

  // ============================================================
  // 🔥 تشخیص مسیر فعال
  // ============================================================
  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // ============================================================
  // 🔥 عنوان صفحه
  // ============================================================
  const pageTitle = (() => {
    const path = location.pathname;
    if (path.includes("/admin/hero")) return "مدیریت اسلایدها";
    if (path.includes("/admin/help")) return "راهنما";
    if (path.includes("/admin/employees")) return "مدیریت کارمندان";
    if (path.includes("/admin/events/enrollments")) return "مدیریت ثبت‌نام‌ها";
    if (path.includes("/admin/events")) return "مدیریت رویدادها";
    if (path.includes("/admin/blog")) return "مدیریت بلاگ";
    if (path.includes("/admin/users")) return "مدیریت کاربران";
    if (path.includes("/admin/tickets")) return "مدیریت تیکت‌ها";
    if (path.includes("/admin/messages")) return "مدیریت پیام‌ها";
    if (path.includes("/admin/settings")) return "تنظیمات";
    if (path.includes("/admin/profile")) return "پروفایل";
    if (path.includes("/admin/partners")) return "مدیریت همکاران";
    if (path.includes("/admin/dashboard")) return "داشبورد";
    return "پنل مدیریت";
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* ========== Navbar ========== */}
      <nav className="sticky top-0 z-50 p-4">
        <LiquidGlassCard
          className="px-4 py-2 md:px-6 md:py-3"
          borderRadius="100px"
          blurIntensity="lg"
          glowIntensity="md"
          shadowIntensity="md"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white/70 hover:text-white"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white/70 hover:text-white"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <Link to="/admin/dashboard" className="flex items-center gap-2">
                <span className="text-xl md:text-2xl">🚀</span>
                <span className="text-base md:text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hidden sm:inline">
                  Supreme Panel
                </span>
                <span className="text-base md:text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent sm:hidden">
                  SP
                </span>
              </Link>

              <span className="hidden md:inline text-sm text-white/50 mr-2">
                / {pageTitle}
              </span>

              <span className="hidden md:inline text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20">
                {isAdmin ? "👑 ادمین" : isEmployee ? "👤 کارمند" : "کاربر"}
              </span>
            </div>

            <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10" />
                <input
                  type="text"
                  placeholder="جستجو..."
                  className="w-full px-4 py-1.5 pr-10 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-white text-sm font-medium leading-tight">
                      {user?.name || "کاربر"}
                    </p>
                    <p className="text-white/40 text-xs">
                      {isAdmin ? "مدیر سیستم" : isEmployee ? "کارمند" : "کاربر"}
                    </p>
                  </div>
                </div>
              </div>

              <GlassButton
                icon={<LogOut size={18} />}
                iconPosition="left"
                variant="danger"
                size="sm"
                onClick={handleLogout}
                className="!rounded-full !px-3 md:!px-4 !py-1.5"
              >
                <span className="hidden md:inline">خروج</span>
                <span className="md:hidden">🚪</span>
              </GlassButton>
            </div>
          </div>
        </LiquidGlassCard>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-4">
            <LiquidGlassCard
              blurIntensity="lg"
              borderRadius="24px"
              glowIntensity="sm"
              className="p-4"
            >
              <nav className="flex flex-col gap-2">
                {filteredMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {user?.name || "کاربر"}
                    </p>
                    <p className="text-white/40 text-sm">
                      {isAdmin ? "مدیر سیستم" : isEmployee ? "کارمند" : "کاربر"}
                    </p>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        )}
      </nav>

      {/* ========== محتوای اصلی ========== */}
      <div className="flex gap-4 px-4 pb-4">
        <aside
          className={`
          ${sidebarOpen ? "w-64" : "w-0 md:w-0"}
          transition-all duration-300 overflow-hidden
        `}
        >
          {sidebarOpen && (
            <LiquidGlassCard
              className="p-4"
              borderRadius="16px"
              blurIntensity="sm"
              glowIntensity="sm"
              shadowIntensity="md"
            >
              <nav className="space-y-1">
                {filteredMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive(item.path)
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span className="group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <button
                onClick={() => setSidebarOpen(false)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200"
              >
                <ChevronRight size={16} />
                <span className="text-xs">جمع کردن</span>
              </button>
            </LiquidGlassCard>
          )}
        </aside>

        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed right-4 bottom-4 md:static md:right-auto md:bottom-auto p-3 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-400 hover:bg-blue-500/30 transition-all duration-300 md:hidden z-40"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <main className="flex-1">
          <LiquidGlassCard
            className="p-4 md:p-6 min-h-[calc(100vh-120px)]"
            borderRadius="16px"
            blurIntensity="xl"
            glowIntensity="sm"
            shadowIntensity="md"
          >
            {children}
          </LiquidGlassCard>
        </main>
      </div>
    </div>
  );
}
