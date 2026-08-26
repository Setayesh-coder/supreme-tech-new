import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { partnersAPI } from "../../../lib/api/partners";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { Plus, Edit, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";
import { toast } from "../../../hooks/use-toast";

interface Partner {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  order: number;
  isActive: boolean;
}

export default function PartnersList() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await partnersAPI.getAll();
      setPartners(data || []);
    } catch (err) {
      setError("خطا در دریافت همکاران");
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
      toast.error("خطا در حذف همکار");
      console.error(err);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await partnersAPI.update(id, { isActive: !currentStatus });
      setPartners(
        partners.map((p) =>
          p.id === id ? { ...p, isActive: !currentStatus } : p,
        ),
      );
    } catch (err) {
      toast.error("خطا در تغییر وضعیت");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-400">در حال بارگذاری...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">🤝 همکاران</h1>
            <p className="text-white/60 text-sm">مدیریت همکاران و شرکا</p>
          </div>
          <Link to="/admin/partners/create">
            <GlassButton variant="primary" size="md" icon={<Plus size={18} />}>
              همکار جدید
            </GlassButton>
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {partners.length === 0 ? (
          <LiquidGlassCard className="p-12 text-center" borderRadius="16px">
            <p className="text-gray-400">هیچ همکاری ثبت نشده است</p>
            <Link to="/admin/partners/create">
              <GlassButton variant="primary" size="sm" className="mt-4">
                افزودن اولین همکار
              </GlassButton>
            </Link>
          </LiquidGlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner) => (
              <LiquidGlassCard
                key={partner.id}
                className="p-4"
                borderRadius="16px"
                blurIntensity="sm"
                glowIntensity="sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{partner.name}</h3>
                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 mt-1 break-all"
                      >
                        {partner.website}
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {partner.description && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                        {partner.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          partner.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {partner.isActive ? "فعال" : "غیرفعال"}
                      </span>
                      <span className="text-xs text-gray-500">
                        ترتیب: {partner.order}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
                  <Link
                    to={`/admin/partners/edit/${partner.id}`}
                    className="flex-1"
                  >
                    <GlassButton
                      variant="white"
                      size="sm"
                      fullWidth
                      icon={<Edit size={14} />}
                      iconPosition="left"
                    >
                      ویرایش
                    </GlassButton>
                  </Link>
                  <button
                    onClick={() =>
                      handleToggleActive(partner.id, partner.isActive)
                    }
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    title={partner.isActive ? "غیرفعال کردن" : "فعال کردن"}
                  >
                    {partner.isActive ? (
                      <EyeOff size={16} className="text-gray-400" />
                    ) : (
                      <Eye size={16} className="text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                    title="حذف"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
