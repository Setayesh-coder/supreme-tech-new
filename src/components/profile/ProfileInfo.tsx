import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import { User, Phone, Mail, Edit2, Save, X, LogOut } from "lucide-react";

interface ProfileInfoProps {
  user: {
    name: string;
    email?: string;
    phone: string;
  };
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  editing: boolean;
  saving: boolean;
  error: string;
  success: string;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogout: () => void;
}

export function ProfileInfo({
  user,
  formData,
  editing,
  saving,
  error,
  success,
  onEdit,
  onCancel,
  onSave,
  onChange,
  onLogout,
}: ProfileInfoProps) {
  return (
    <LiquidGlassCard
      className="p-6"
      borderRadius="20px"
      blurIntensity="lg"
      glowIntensity="md"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          اطلاعات شخصی
        </h2>
        {!editing && (
          <button
            onClick={onEdit}
            className="p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-all duration-300"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4 text-sm">
          ✅ {success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            نام کامل
          </label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              disabled={!editing}
              className={`w-full pr-10 pl-4 py-2.5 bg-white/5 border rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none transition-all duration-200 ${
                editing
                  ? "border-blue-500/50 focus:ring-2 focus:ring-blue-500/30"
                  : "border-white/10 cursor-not-allowed opacity-60"
              }`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            شماره تلفن
          </label>
          <div className="relative">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              disabled={!editing}
              className={`w-full pr-10 pl-4 py-2.5 bg-white/5 border rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none transition-all duration-200 ${
                editing
                  ? "border-blue-500/50 focus:ring-2 focus:ring-blue-500/30"
                  : "border-white/10 cursor-not-allowed opacity-60"
              }`}
            />
          </div>
        </div>

        {user.email && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              ایمیل
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                disabled={!editing}
                className={`w-full pr-10 pl-4 py-2.5 bg-white/5 border rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none transition-all duration-200 ${
                  editing
                    ? "border-blue-500/50 focus:ring-2 focus:ring-blue-500/30"
                    : "border-white/10 cursor-not-allowed opacity-60"
                }`}
              />
            </div>
          </div>
        )}

        {editing && (
          <div className="flex gap-2 pt-2">
            <GlassButton
              variant="primary"
              size="sm"
              loading={saving}
              icon={<Save className="w-4 h-4" />}
              iconPosition="left"
              onClick={onSave}
              className="flex-1"
            >
              ذخیره
            </GlassButton>
            <GlassButton
              variant="white"
              size="sm"
              icon={<X className="w-4 h-4" />}
              iconPosition="left"
              onClick={onCancel}
            >
              انصراف
            </GlassButton>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all duration-300 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          خروج از حساب کاربری
        </button>
      </div>
    </LiquidGlassCard>
  );
}
