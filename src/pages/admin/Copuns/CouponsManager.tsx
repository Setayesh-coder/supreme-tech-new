// src/components/admin/CouponsManager.tsx
import { useState, useEffect } from "react";
import { couponsAPI } from "../../../lib/api/coupons";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import {
  Plus,
  Loader2,
  Search,
  X,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Users,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: "PERCENT" | "FIXED";
  discount_value: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  expires_at: string;
  created_at: string;
}

export default function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "PERCENT" as "PERCENT" | "FIXED",
    discount_value: 0,
    max_uses: 1,
    expires_at: "",
  });
  const [filter, setFilter] = useState({
    search: "",
    is_active: undefined as boolean | undefined,
  });

  // ✅ دریافت لیست کدهای تخفیف
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const params: any = {};
      if (filter.search) params.search = filter.search;
      if (filter.is_active !== undefined) params.is_active = filter.is_active;

      const response = await couponsAPI.getAll(params);
      const items = response.items || (Array.isArray(response) ? response : []);
      setCoupons(items);
    } catch (err: any) {
      console.error("❌ خطا در دریافت کدهای تخفیف:", err);
      setError(err.response?.data?.detail || "خطا در دریافت کدهای تخفیف");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ایجاد کد تخفیف جدید
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsProcessing(true);

    try {
      await couponsAPI.create(formData);
      setSuccess("✅ کد تخفیف با موفقیت ایجاد شد!");
      setShowCreateModal(false);
      resetForm();
      await fetchCoupons();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("❌ خطا در ایجاد کد تخفیف:", err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(", "));
      } else {
        setError(detail || "خطا در ایجاد کد تخفیف");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ تغییر وضعیت کد تخفیف
  const handleToggleStatus = async (couponId: string, isActive: boolean) => {
    setError("");
    setSuccess("");
    setIsProcessing(true);

    try {
      await couponsAPI.updateStatus(couponId, isActive);
      setSuccess(`✅ کد تخفیف ${isActive ? "فعال" : "غیرفعال"} شد!`);
      await fetchCoupons();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("❌ خطا در تغییر وضعیت:", err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(", "));
      } else {
        setError(detail || "خطا در تغییر وضعیت کد تخفیف");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ حذف/غیرفعال کردن کد تخفیف
  const handleDelete = async (couponId: string, code: string) => {
    if (!window.confirm(`آیا از غیرفعال کردن کد تخفیف "${code}" مطمئن هستید؟`))
      return;

    setError("");
    setSuccess("");
    setIsProcessing(true);

    try {
      await couponsAPI.delete(couponId);
      setSuccess(`✅ کد تخفیف "${code}" با موفقیت غیرفعال شد!`);
      await fetchCoupons();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("❌ خطا در غیرفعال کردن کد تخفیف:", err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(", "));
      } else {
        setError(detail || "خطا در غیرفعال کردن کد تخفیف");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discount_type: "PERCENT",
      discount_value: 0,
      max_uses: 1,
      expires_at: "",
    });
  };

  useEffect(() => {
    fetchCoupons();
  }, [filter]);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} تومان`;
  };

  const formatDate = (date: string) => {
    if (!date) return "نامشخص";
    return new Date(date).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Tag className="w-6 h-6 text-blue-400" />
              مدیریت کدهای تخفیف
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              ایجاد، ویرایش و مدیریت کدهای تخفیف
            </p>
          </div>

          <GlassButton
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
          >
            کد تخفیف جدید
          </GlassButton>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-center text-sm">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl text-center text-sm animate-in fade-in duration-300">
            {success}
          </div>
        )}

        {/* Filters */}
        <LiquidGlassCard
          className="p-4"
          borderRadius="16px"
          blurIntensity="sm"
          glowIntensity="sm"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filter.search}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value })
                }
                placeholder="جستجوی کد تخفیف..."
                className="w-full pr-10 pl-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <select
              value={
                filter.is_active === undefined ? "" : String(filter.is_active)
              }
              onChange={(e) => {
                const value = e.target.value;
                setFilter({
                  ...filter,
                  is_active: value === "" ? undefined : value === "true",
                });
              }}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>

            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setFilter({ search: "", is_active: undefined })}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              ریست
            </GlassButton>
          </div>
        </LiquidGlassCard>

        {/* Coupons List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <LiquidGlassCard className="p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Tag className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                هیچ کد تخفیفی یافت نشد
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                اولین کد تخفیف خود را ایجاد کنید
              </p>
              <GlassButton
                variant="primary"
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
              >
                ایجاد کد تخفیف
              </GlassButton>
            </div>
          </LiquidGlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => {
              const expired = isExpired(coupon.expires_at);
              const canUse =
                coupon.is_active &&
                !expired &&
                coupon.used_count < coupon.max_uses;

              return (
                <LiquidGlassCard
                  key={coupon.id}
                  className="p-5 hover:scale-[1.02] transition-all duration-300"
                  borderRadius="16px"
                  blurIntensity="sm"
                  glowIntensity="sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold font-mono text-white">
                          {coupon.code}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            coupon.is_active && !expired
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {coupon.is_active && !expired ? "فعال" : "غیرفعال"}
                        </span>
                      </div>

                      {coupon.description && (
                        <p className="text-sm text-gray-400 mt-1">
                          {coupon.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                        <span className="flex items-center gap-1 text-blue-400">
                          {coupon.discount_type === "PERCENT" ? (
                            <Percent className="w-3 h-3" />
                          ) : (
                            <DollarSign className="w-3 h-3" />
                          )}
                          {coupon.discount_type === "PERCENT"
                            ? `${coupon.discount_value}%`
                            : formatPrice(coupon.discount_value)}
                        </span>

                        <span className="flex items-center gap-1 text-gray-400">
                          <Users className="w-3 h-3" />
                          {coupon.used_count}/{coupon.max_uses}
                        </span>

                        <span className="flex items-center gap-1 text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {formatDate(coupon.expires_at)}
                        </span>
                      </div>

                      {expired && (
                        <div className="mt-2 flex items-center gap-1 text-red-400 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          منقضی شده
                        </div>
                      )}

                      {!expired && coupon.used_count >= coupon.max_uses && (
                        <div className="mt-2 flex items-center gap-1 text-yellow-400 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          مصرف شده
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() =>
                          handleToggleStatus(coupon.id, !coupon.is_active)
                        }
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title={coupon.is_active ? "غیرفعال کردن" : "فعال کردن"}
                        disabled={isProcessing}
                      >
                        {coupon.is_active ? (
                          <EyeOff className="w-4 h-4 text-gray-400 hover:text-red-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400 hover:text-green-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="غیرفعال کردن کد تخفیف"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      ایجاد: {formatDate(coupon.created_at)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        canUse
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {canUse ? "قابل استفاده" : "غیرقابل استفاده"}
                    </span>
                  </div>
                </LiquidGlassCard>
              );
            })}
          </div>
        )}

        {/* Modal Create */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <LiquidGlassCard
              className="w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
              borderRadius="24px"
              blurIntensity="xl"
              glowIntensity="md"
            >
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  ایجاد کد تخفیف جدید
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  اطلاعات کد تخفیف را وارد کنید
                </p>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    کد تخفیف *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase().replace(/\s/g, ""),
                      })
                    }
                    placeholder="مثال: SUPREME50"
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    توضیحات
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="توضیحات کد تخفیف..."
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    نوع تخفیف *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_type: e.target.value as "PERCENT" | "FIXED",
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="PERCENT">درصدی (%)</option>
                    <option value="FIXED">مبلغ ثابت (تومان)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    مقدار تخفیف *
                  </label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_value: Number(e.target.value),
                      })
                    }
                    placeholder={
                      formData.discount_type === "PERCENT"
                        ? "مثال: 50"
                        : "مثال: 100000"
                    }
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    تعداد دفعات استفاده *
                  </label>
                  <input
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_uses: Number(e.target.value),
                      })
                    }
                    placeholder="مثال: 100"
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    تاریخ انقضا *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) =>
                      setFormData({ ...formData, expires_at: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm">
                    ❌ {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <GlassButton
                    type="button"
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    انصراف
                  </GlassButton>
                  <GlassButton
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    loading={isProcessing}
                    disabled={isProcessing}
                  >
                    ایجاد
                  </GlassButton>
                </div>
              </form>
            </LiquidGlassCard>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
