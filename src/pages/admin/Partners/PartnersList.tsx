// src/pages/admin/Partners/PartnerList.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { OptimizedImage } from "../../../components/ui/OptimizedImage";
import { partnersAPI } from "../../../lib/api/partners";
import { Plus, Edit, Trash2, Loader2, Building2, Check, X } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PartnerList() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await partnersAPI.getAll();
      setPartners(data);
    } catch (err) {
      setError("خطا در دریافت لیست همکاران");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این همکار مطمئن هستید؟")) return;
    try {
      await partnersAPI.delete(id);
      setPartners(partners.filter((p) => p.id !== id));
    } catch (err) {
      alert("خطا در حذف همکار");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await partnersAPI.update(id, { isActive: !currentStatus });
      setPartners(
        partners.map((p) =>
          p.id === id ? { ...p, isActive: !currentStatus } : p,
        ),
      );
    } catch (err) {
      alert("خطا در تغییر وضعیت");
    }
  };

  const handleImageError = (partnerId: string) => {
    setImageErrors((prev) => ({ ...prev, [partnerId]: true }));
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">🤝 مدیریت همکاران</h1>
            <p className="text-white/60 text-sm">لیست تمام همکاران و شرکا</p>
          </div>
          <Link to="/admin/partners/create">
            <GlassButton
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              iconPosition="left"
            >
              همکار جدید
            </GlassButton>
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {partners.map((partner) => {
            const hasError = imageErrors[partner.id];
            
            return (
              <LiquidGlassCard
                key={partner.id}
                className="p-4"
                borderRadius="16px"
                blurIntensity="sm"
                glowIntensity="sm"
              >
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  {/* 🔥 لوگو با OptimizedImage */}
                  <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    {partner.logo && !hasError ? (
                      <OptimizedImage
                        src={partner.logo}
                        alt={partner.name}
                        className="w-12 h-12 object-contain"
                        objectFit="contain"
                        quality={80}
                        loading="lazy"
                        fallback=""
                        placeholder={false}
                        onError={() => handleImageError(partner.id)}
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-white/20" />
                    )}
                  </div>

                  {/* اطلاعات */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {partner.name}
                        </h3>
                        {partner.website && (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 transition"
                          >
                            {partner.website}
                          </a>
                        )}
                        {partner.description && (
                          <p className="text-gray-400 text-sm line-clamp-1">
                            {partner.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            partner.isActive
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {partner.isActive ? (
                            <span className="flex items-center gap-1">
                              <Check className="w-3 h-3" /> فعال
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <X className="w-3 h-3" /> غیرفعال
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          ترتیب: {partner.order}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* عملیات */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleToggleStatus(partner.id, partner.isActive)
                      }
                      className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors"
                      title={partner.isActive ? "غیرفعال کردن" : "فعال کردن"}
                    >
                      {partner.isActive ? <X size={18} /> : <Check size={18} />}
                    </button>
                    <Link to={`/admin/partners/edit/${partner.id}`}>
                      <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(partner.id)}
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

        {partners.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg">هیچ همکاری ثبت نشده است</p>
            <p className="text-sm text-gray-600">
              اولین همکار خود را اضافه کنید
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}