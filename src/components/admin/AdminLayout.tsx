// src/components/admin/AdminLayout.tsx
import { type ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  // User,
  Bell,
  Search,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    authAPI.logout();
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  const menuItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "داشبورد",
      path: "/admin/dashboard",
    },
    { icon: <FileText size={20} />, label: "بلاگ", path: "/admin/blog" },
    { icon: <Calendar size={20} />, label: "رویدادها", path: "/admin/events" },
    { icon: <Users size={20} />, label: "کاربران", path: "/admin/users" },
    { icon: <Settings size={20} />, label: "تنظیمات", path: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* ========== Navbar ========== */}
      <nav className="sticky top-0 z-50 p-4">
        <LiquidGlassCard
          className="px-4 py-2 md:px-6 md:py-3"
          borderRadius="100px"  // ← گرد مثل هدر عمومی
          blurIntensity="lg"    // ← تاری بیشتر
          glowIntensity="md"    // ← درخشش بیشتر
          shadowIntensity="md"
        >
          <div className="flex justify-between items-center">
            {/* سمت راست - منو و لوگو */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* دکمه منو - با استایل شیشه‌ای */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white/70 hover:text-white"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* دکمه منو موبایل */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white/70 hover:text-white"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* لوگو */}
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-2"
              >
                <span className="text-xl md:text-2xl">🚀</span>
                <span className="text-base md:text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hidden sm:inline">
                  Supreme Admin
                </span>
                <span className="text-base md:text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent sm:hidden">
                  SA
                </span>
              </Link>
            </div>

            {/* وسط - نوار جستجو (اختیاری) */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="جستجو..."
                  className="w-full px-4 py-1.5 pr-10 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* سمت چپ - اطلاع‌ها و پروفایل */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* دکمه اطلاع‌رسانی */}
              <button className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white/70 hover:text-white">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>

              {/* پروفایل */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {admin.name?.charAt(0) || "A"}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-white text-sm font-medium leading-tight">
                      {admin.name || "مدیر"}
                    </p>
                    <p className="text-white/40 text-xs">مدیر سیستم</p>
                  </div>
                </div>
              </div>

              {/* دکمه خروج - با GlassButton */}
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

        {/* منوی موبایل */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4">
            <LiquidGlassCard
              blurIntensity="lg"
              borderRadius="24px"
              glowIntensity="sm"
              className="p-4"
            >
              <nav className="flex flex-col gap-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              {/* پروفایل موبایل */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {admin.name?.charAt(0) || "A"}
                  </div>
                  <div>
                    <p className="text-white font-medium">{admin.name || "مدیر"}</p>
                    <p className="text-white/40 text-sm">مدیر سیستم</p>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        )}
      </nav>

      {/* ========== محتوای اصلی ========== */}
      <div className="flex gap-4 px-4 pb-4">
        {/* Sidebar */}
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
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 group"
                  >
                    <span className="group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              {/* دکمه جمع کردن سایدبار */}
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

        {/* دکمه باز کردن سایدبار (وقتی بسته باشه) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed right-4 bottom-4 md:static md:right-auto md:bottom-auto p-3 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-400 hover:bg-blue-500/30 transition-all duration-300 md:hidden z-40"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Main Content */}
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