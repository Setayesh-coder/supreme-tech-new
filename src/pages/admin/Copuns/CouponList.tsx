// src/pages/admin/Coupons/CouponList.tsx
import { useState, useEffect } from "react";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { couponsAPI } from "../../../lib/api/coupons";
import {
  Plus,
  Search,
  Edit,
  Ticket,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: "PERCENT" | "FIXED";
  discount_value: number;
  max_uses: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export default function CouponList() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponsAPI.getAll({ limit: 100 });
      setCoupons(data.items || []);
    } catch (err) {
      console.error("❌ خطا:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await couponsAPI.updateStatus(id, !currentStatus);
      await fetchCoupons();
    } catch (err) {
      alert("خطا در تغییر وضعیت");
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === "PERCENT") {
      return `${coupon.discount_value}%`;
    }
    return `${coupon.discount_value.toLocaleString()} تومان`;
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()),
  );

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
      <div className="max-w-6xl mx-auto">
        {/* هدر */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              🎫 مدیریت کدهای تخفیف
            </h1>
            <p className="text-gray-400 text-sm">مدیریت کدهای تخفیف</p>
          </div>
          <GlassButton
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            onClick={() => {
              /* navigate to create */
            }}
          >
            کد تخفیف جدید
          </GlassButton>
        </div>

        {/* جستجو */}
        <div className="relative mb-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی کد تخفیف..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* لیست */}
        <div className="space-y-3">
          {filteredCoupons.map((coupon) => (
            <LiquidGlassCard
              key={coupon.id}
              className="p-4"
              borderRadius="16px"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white font-mono">
                      {coupon.code}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        coupon.is_active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {coupon.is_active ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> فعال
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> غیرفعال
                        </span>
                      )}
                    </span>
                  </div>
                  {coupon.description && (
                    <p className="text-gray-400 text-sm">
                      {coupon.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-400">
                    <span>
                      تخفیف:{" "}
                      <span className="text-white">
                        {formatDiscount(coupon)}
                      </span>
                    </span>
                    <span>
                      استفاده: {coupon.used_count} / {coupon.max_uses}
                    </span>
                    <span>
                      انقضا:{" "}
                      {new Date(coupon.expires_at).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    icon={<Edit className="w-4 h-4" />}
                    iconPosition="left"
                    onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                  >
                    {coupon.is_active ? "غیرفعال" : "فعال"}
                  </GlassButton>
                </div>
              </div>
            </LiquidGlassCard>
          ))}
        </div>

        {filteredCoupons.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p>هیچ کد تخفیفی یافت نشد</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
