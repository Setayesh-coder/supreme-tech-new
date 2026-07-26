// src/components/profile/ProfileHeader.tsx
import { Calendar, LogOut, ShoppingCart } from "lucide-react";

interface ProfileHeaderProps {
  user: {
    name: string;
    createdAt: string;
  };
  cartCount: number;
  onLogout: () => void;
  onCartClick: () => void;
}

export function ProfileHeader({
  user,
  cartCount,
  onLogout,
  onCartClick,
}: ProfileHeaderProps) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/30 via-purple-600/20 to-pink-600/30 backdrop-blur-sm border border-white/10 p-6 md:p-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl md:text-3xl font-bold text-white shadow-lg shadow-blue-500/25">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {user.name}
            </h1>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              عضو از {new Date(user.createdAt).toLocaleDateString("fa-IR")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cartCount > 0 && (
            <button
              onClick={onCartClick}
              className="px-4 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              سبد خرید
              <span className="bg-orange-500/30 text-white text-xs px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            </button>
          )}
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </div>
    </div>
  );
}
