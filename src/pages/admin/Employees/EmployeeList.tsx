import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { employeesAPI } from "../../../lib/api/employees";
import type { EmployeePublic } from "../../../lib/api/employees";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { showConfirmToast } from "../../../components/ui/confirm-toast";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  UserCog,
  Mail,
  Phone,
  Calendar,
  Loader2,
  Shield,
  User,
  Building2,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

// ✅ تایپ توسعه‌یافته برای نمایش در لیست (با فیلدهای اضافی از API)
interface EmployeeListItem extends EmployeePublic {
  phone?: string;
  email?: string;
  national_id?: string;
  role?: string;
  is_active?: boolean;
  created_at?: string;
  _count?: {
    managedEvents: number;
    tickets?: number;
  };
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeesAPI.getPublic();
      // ✅ تبدیل داده‌ها به فرمت مورد نظر
      const formattedData = (data || []).map((item) => ({
        ...item,
        is_active: true, // مقدار پیش‌فرض
        role: "EMPLOYEE", // مقدار پیش‌فرض
        created_at: new Date().toISOString(),
      }));
      setEmployees(formattedData);
    } catch (err) {
      setError("خطا در دریافت لیست کارمندان");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirmToast({
      title: "آیا از حذف این کارمند مطمئن هستید؟",
      description: "این عمل غیرقابل بازگشت است.",
      variant: "danger",
      confirmText: "بله، حذف شود",
      cancelText: "انصراف",
      onConfirm: async () => {
        try {
          await employeesAPI.delete(id);
          setEmployees(employees.filter((e) => e.id !== id));
          toast.success("✅ کارمند با موفقیت حذف شد");
        } catch (err) {
          toast.error("❌ خطا در حذف کارمند");
        }
      },
    });
  };
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await employeesAPI.update(id, { is_active: !currentStatus });
      setEmployees(
        employees.map((e) =>
          e.id === id ? { ...e, is_active: !currentStatus } : e,
        ),
      );
    } catch (err) {
      toast.error("خطا در تغییر وضعیت");
    }
  };

  const getRoleLabel = (role?: string) => {
    const roles: Record<string, { label: string; color: string; icon: any }> = {
      EMPLOYEE: { label: "کارمند", color: "text-blue-400", icon: User },
      MANAGER: { label: "مدیر", color: "text-purple-400", icon: Shield },
      ADMIN: { label: "ادمین", color: "text-red-400", icon: Shield },
    };
    return (
      roles[role || "EMPLOYEE"] || {
        label: role || "کارمند",
        color: "text-gray-400",
        icon: User,
      }
    );
  };

  const filteredEmployees = employees.filter((employee) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return employee.is_active !== false;
    if (filter === "INACTIVE") return employee.is_active === false;
    return employee.role === filter;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <UserCog className="w-6 h-6 text-blue-400" />
              مدیریت کارمندان
            </h1>
            <p className="text-white/60 text-sm">لیست تمام کارمندان سیستم</p>
          </div>
          <Link to="/admin/employees/create">
            <GlassButton
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              iconPosition="left"
            >
              کارمند جدید
            </GlassButton>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
              filter === "ALL"
                ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
            }`}
          >
            همه
          </button>
          <button
            onClick={() => setFilter("ACTIVE")}
            className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
              filter === "ACTIVE"
                ? "bg-green-500/20 text-green-400 border border-green-400/30"
                : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
            }`}
          >
            فعال
          </button>
          <button
            onClick={() => setFilter("INACTIVE")}
            className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
              filter === "INACTIVE"
                ? "bg-red-500/20 text-red-400 border border-red-400/30"
                : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
            }`}
          >
            غیرفعال
          </button>
          <button
            onClick={() => setFilter("EMPLOYEE")}
            className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
              filter === "EMPLOYEE"
                ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
            }`}
          >
            کارمند
          </button>
          <button
            onClick={() => setFilter("MANAGER")}
            className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
              filter === "MANAGER"
                ? "bg-purple-500/20 text-purple-400 border border-purple-400/30"
                : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
            }`}
          >
            مدیر
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredEmployees.map((employee) => {
            const role = getRoleLabel(employee.role);
            const RoleIcon = role.icon;

            return (
              <LiquidGlassCard
                key={employee.id}
                className="p-4 hover:bg-white/5 transition-all duration-300"
                borderRadius="16px"
                blurIntensity="sm"
                glowIntensity="sm"
              >
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {employee.avatar ? (
                      <img
                        src={employee.avatar}
                        alt={employee.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      employee.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* اطلاعات */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {employee.name}
                          <span
                            className={`text-xs font-medium ${role.color} flex items-center gap-1`}
                          >
                            <RoleIcon className="w-3 h-3" />
                            {role.label}
                          </span>
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-400">
                          {employee.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {employee.phone}
                            </span>
                          )}
                          {employee.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {employee.email}
                            </span>
                          )}
                          {employee.position && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {employee.position}
                            </span>
                          )}
                          {employee.department && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {employee.department}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            employee.is_active !== false
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {employee.is_active !== false ? (
                            <span className="flex items-center gap-1">
                              <Check className="w-3 h-3" /> فعال
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <X className="w-3 h-3" /> غیرفعال
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                      {employee.created_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          عضو از{" "}
                          {new Date(employee.created_at).toLocaleDateString(
                            "fa-IR",
                          )}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        📊 {employee._count?.managedEvents || 0} رویداد مدیریت
                        شده
                      </span>
                    </div>
                  </div>

                  {/* عملیات */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleToggleStatus(
                          employee.id,
                          employee.is_active !== false,
                        )
                      }
                      className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors"
                      title={
                        employee.is_active !== false
                          ? "غیرفعال کردن"
                          : "فعال کردن"
                      }
                    >
                      {employee.is_active !== false ? (
                        <X size={18} />
                      ) : (
                        <Check size={18} />
                      )}
                    </button>
                    <Link to={`/admin/employees/edit/${employee.id}`}>
                      <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </LiquidGlassCard>
            );
          })}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg">هیچ کارمندی یافت نشد</p>
            <p className="text-sm text-gray-400">
              با فیلترهای مختلف امتحان کنید یا کارمند جدید اضافه کنید
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
