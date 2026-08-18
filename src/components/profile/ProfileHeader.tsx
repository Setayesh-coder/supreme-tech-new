// src/components/profile/ProfileHeader.tsx
import { User, RectangleEllipsis, LogOut } from "lucide-react";
import { GlassButton } from "../ui/GlassButton";

interface ProfileHeaderProps {
  user: {
    name?: string;
    phone?: string;
    email?: string;
    role?: string;
  } | null;
  cartCount: number;
  onLogout: () => void;
  onCartClick: () => void;
}

export default function ProfileHeader({
  user,
  cartCount,
  onLogout,
  onCartClick,
}: ProfileHeaderProps) {
  const userName = user?.name || user?.phone || "کاربر";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-blue-400" />
          {userName}
        </h1>
        <p className="text-gray-400 text-sm">
          {user?.email || user?.phone || "اطلاعات کاربر"}
        </p>
        {user?.role && (
          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
            {user.role === "ADMIN" ? "ادمین" : "کاربر"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <GlassButton
          variant="secondary"
          size="sm"
          icon={<RectangleEllipsis className="w-4 h-4" />}
          iconPosition="left"
          onClick={onCartClick}
        >
          تغییر رمز{cartCount > 0 && `(${cartCount})`}
        </GlassButton>
        <GlassButton
          variant="danger"
          size="sm"
          icon={<LogOut className="w-4 h-4" />}
          iconPosition="left"
          onClick={onLogout}
        >
          خروج
        </GlassButton>
      </div>
    </div>
  );
}
