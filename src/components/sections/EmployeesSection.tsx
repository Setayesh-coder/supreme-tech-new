// src/components/sections/EmployeesSection.tsx
import { useEffect, useState } from "react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import type { Employee } from "../../lib/api/employees";
import { employeesAPI } from "../../lib/api/employees";
import {
  Users,
  Briefcase,
  Building2,
  //   Mail,
  //   Phone,
  Loader2,
} from "lucide-react";

export default function EmployeesSection() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await employeesAPI.getAll();
        // فقط کارمندان فعال رو نمایش بده
        const activeEmployees = Array.isArray(data)
          ? data.filter((emp) => emp.isActive === true)
          : [];
        setEmployees(activeEmployees);
      } catch (err) {
        setError("خطا در دریافت اطلاعات کارمندان");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      EMPLOYEE: "کارمند",
      MANAGER: "مدیر",
      ADMIN: "ادمین",
    };
    return roles[role] || role;
  };

  if (loading) {
    return (
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center">
              <LiquidGlassCard
                blurIntensity="md"
                borderRadius="100px"
                glowIntensity="sm"
                className="inline-flex px-4 py-2 mb-4"
              >
                <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  تیم ما
                </span>
              </LiquidGlassCard>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                با تیم ما آشنا شوید
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              تیم Supreme Tech متشکل از متخصصان با تجربه در حوزه هوش مصنوعی و
              فناوری است.
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (employees.length === 0) {
    return (
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center">
              <LiquidGlassCard
                blurIntensity="md"
                borderRadius="100px"
                glowIntensity="sm"
                className="inline-flex px-4 py-2 mb-4"
              >
                <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  تیم ما
                </span>
              </LiquidGlassCard>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                با تیم ما آشنا شوید
              </span>
            </h2>
          </div>
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">هنوز کارمندی ثبت نشده است</p>
            <p className="text-gray-500 text-sm mt-1">
              به زودی تیم ما تکمیل خواهد شد
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center">
            <LiquidGlassCard
              blurIntensity="md"
              borderRadius="100px"
              glowIntensity="sm"
              className="inline-flex px-4 py-2 mb-4"
            >
              <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                تیم ما
              </span>
            </LiquidGlassCard>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              با تیم ما آشنا شوید
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            متخصصان ما با تجربه و تخصص خود، آماده ارائه بهترین خدمات به شما
            هستند.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {employees.map((employee) => (
            <LiquidGlassCard
              key={employee.id}
              className="p-6 text-center hover:scale-105 transition-all duration-300"
              borderRadius="20px"
              blurIntensity="sm"
              glowIntensity="sm"
            >
              {/* Avatar */}
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-blue-500/20">
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

              {/* Name */}
              <h3 className="text-xl font-bold text-white mb-1">
                {employee.name}
              </h3>

              {/* Position */}
              {employee.position && (
                <p className="text-blue-400 text-sm font-medium mb-2">
                  {employee.position}
                </p>
              )}

              {/* Department */}
              {employee.department && (
                <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-2">
                  <Building2 className="w-3 h-3" />
                  <span>{employee.department}</span>
                </div>
              )}

              {/* Role Badge */}
              <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10 mb-3">
                {getRoleLabel(employee.role)}
              </div>

              {/* Contact */}
              {/* <div className="space-y-1 text-xs text-gray-500">
                {employee.email && (
                  <div className="flex items-center justify-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">
                      {employee.email}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{employee.phone}</span>
                </div>
              </div> */}

              {/* Events Count */}
              {employee._count?.managedEvents !== undefined && (
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-500">
                  <span className="flex items-center justify-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {employee._count.managedEvents} رویداد مدیریت شده
                  </span>
                </div>
              )}
            </LiquidGlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
