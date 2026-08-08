// src/components/admin/AdminLayout.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BookOpen, 
  Settings, 
  LogOut,
  Menu,
  X,
  Briefcase,
  MessageSquare,
  Ticket,
  Image,
  Building2,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("admin") || localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    localStorage.removeItem("employee");
    navigate("/admin/login");
  };

  const menuItems = [
    { path: "/admin/dashboard", icon: <LayoutDashboard size={20} />, label: "داشبورد" },
    { path: "/admin/users", icon: <Users size={20} />, label: "کاربران" },
    { path: "/admin/events", icon: <Calendar size={20} />, label: "رویدادها" },
    { path: "/admin/courses", icon: <BookOpen size={20} />, label: "دوره‌ها" },
    { path: "/admin/blog", icon: <MessageSquare size={20} />, label: "وبلاگ" },
    { path: "/admin/hero", icon: <Image size={20} />, label: "اسلایدر" },
    { path: "/admin/partners", icon: <Building2 size={20} />, label: "همکاران" },
    { path: "/admin/team", icon: <Users size={20} />, label: "تیم" },
    { path: "/admin/employees", icon: <Briefcase size={20} />, label: "کارمندان" },
    { path: "/admin/tickets", icon: <Ticket size={20} />, label: "تیکت‌ها" },
    { path: "/admin/settings", icon: <Settings size={20} />, label: "تنظیمات" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900">
      {/* سایدبار - همیشه در دسکتاپ باز */}
      <aside className={`
        fixed lg:relative top-0 right-0 h-full w-72 bg-gray-900/98 backdrop-blur-xl border-l border-white/10 z-40
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* لوگو */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">پنل مدیریت</h1>
                <p className="text-white/40 text-xs">Supreme Tech</p>
              </div>
            </div>
          </div>

          {/* دکمه بستن موبایل */}
          <div className="lg:hidden flex justify-end p-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* منو */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive(item.path)
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <span className={isActive(item.path) ? 'text-blue-400' : 'text-white/40'}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* پایین سایدبار */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.name || 'ادمین'}</p>
                <p className="text-white/40 text-xs truncate">{user?.role || 'ADMIN'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors"
            >
              <LogOut size={18} />
              خروج
            </button>
          </div>
        </div>
      </aside>

      {/* محتوای اصلی */}
      <div className="flex-1 min-w-0">
        {/* هدر موبایل */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-gray-900/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Menu size={24} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">پنل مدیریت</span>
          </div>
          <div className="w-10"></div>
        </div>

        {/* هدر دسکتاپ */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-white/10 bg-gray-900/50 backdrop-blur-sm">
          <div>
            <h1 className="text-white font-bold text-xl">پنل مدیریت</h1>
            <p className="text-white/40 text-sm">به پنل مدیریت خوش آمدید</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{user?.name || 'ادمین'}</p>
                <p className="text-white/40 text-xs">{user?.role || 'ADMIN'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* محتوای صفحه */}
        <main className="p-4 lg:p-8 pt-20 lg:pt-4">
          {children}
        </main>
      </div>

      {/* پس‌زمینه سایه برای موبایل */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
