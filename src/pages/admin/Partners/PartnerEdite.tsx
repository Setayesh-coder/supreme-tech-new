// src/pages/admin/partners/PartnerEdit.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { partnersAPI } from "../../../lib/api/partners";
import { uploadAPI } from "../../../lib/api/upload";
import { ArrowLeft, Save, X, Loader2, Building2 } from "lucide-react";
import { toast } from "../../../hooks/use-toast";

export default function PartnerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    order: 0,
    isActive: true,
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [currentLogo, setCurrentLogo] = useState<string>("");

  useEffect(() => {
    const fetchPartner = async () => {
      if (!id) return;
      try {
        const data = await partnersAPI.getById(id);
        setFormData({
          name: data.name,
          description: data.description || "",
          website: data.website || "",
          order: data.order || 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
        });
        if (data.logo) {
          setCurrentLogo(data.logo);
          setLogoPreview(data.logo);
        }
      } catch (err) {
        setError("خطا در دریافت اطلاعات همکار");
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("لطفاً یک فایل تصویری انتخاب کنید");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("حجم تصویر نباید بیشتر از ۲ مگابایت باشد");
        return;
      }
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview("");
    // ✅ اگر لوگو جدیدی انتخاب نشده بود، currentLogo رو هم خالی کن
    if (!logo) {
      setCurrentLogo("");
    }
    const input = document.getElementById("logo-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  // ✅ اصلاح: تابع آپلود با مدیریت خطا
  const uploadLogo = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      // ✅ استفاده صحیح از uploadAPI.uploadImage
      const response = await uploadAPI.uploadImage(file, "partners");
      // console.log("✅ لوگو آپلود شد:", response.url);
      return response.url;
    } catch (error: any) {
      console.error("❌ خطا در آپلود:", error);
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        throw new Error(detail.map((e: any) => e.msg).join(", "));
      }
      throw new Error(detail || "خطا در آپلود لوگو");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      let logoUrl = currentLogo || "";

      // ✅ اگر لوگوی جدید آپلود شده
      if (logo) {
        logoUrl = await uploadLogo(logo);
      }

      // ✅ اگر هیچ لوگویی وجود ندارد (هم قدیم و هم جدید)
      if (!logo && !currentLogo) {
        logoUrl = "";
      }

      const partnerData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        website: formData.website?.trim() || "",
        order: Number(formData.order) || 0,
        isActive: formData.isActive,
        logo: logoUrl,
      };

      // console.log("📤 ارسال داده برای ویرایش همکار:", partnerData);

      await partnersAPI.update(id!, partnerData);

      // ✅ نمایش پیام موفقیت
      toast.success(" همکار با موفقیت ویرایش شد!");
      navigate("/admin/partners");
    } catch (err: any) {
      toast.error(" خطا:", err);

      // ✅ نمایش خطای دقیق
      let errorMessage = "خطا در ویرایش همکار";
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map((e: any) => e.msg).join(", ");
        } else {
          errorMessage = detail;
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/partners")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">✏️ ویرایش همکار</h1>
        </div>

        <LiquidGlassCard
          className="p-6 md:p-8"
          borderRadius="16px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 whitespace-pre-wrap">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* لوگو */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                لوگو
              </label>
              <div className="flex items-start gap-6">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="پیش‌نمایش لوگو"
                      className="w-32 h-32 object-contain rounded-xl border border-white/20 bg-white/5"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-logo.png";
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <p className="text-xs text-gray-400 mt-1 text-center">
                      {logo ? "لوگوی جدید" : "لوگوی فعلی"}
                    </p>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-white/20 border-dashed rounded-xl cursor-pointer hover:border-blue-500/50 transition-colors bg-white/5 hover:bg-white/10">
                    <div className="flex flex-col items-center justify-center">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                      ) : (
                        <>
                          <Building2 className="w-8 h-8 text-gray-400 mb-1" />
                          <p className="text-xs text-gray-400 text-center">
                            آپلود لوگو
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      id="logo-input"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
                <div className="flex-1">
                  <p className="text-sm text-gray-400">
                    {logo ? `فایل: ${logo.name}` : "هیچ لوگویی انتخاب نشده"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, SVG (حداکثر ۲MB)
                  </p>
                </div>
              </div>
            </div>

            {/* نام */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                نام همکار <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="نام همکار را وارد کنید"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* وبسایت */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                وبسایت
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* توضیحات */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                توضیحات
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="توضیحات درباره همکار"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* ترتیب */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                ترتیب نمایش
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                عدد کوچکتر = نمایش زودتر
              </p>
            </div>

            {/* فعال */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-500"
                />
                فعال
              </label>
              <p className="text-xs text-gray-500">
                همکاران غیرفعال در صفحه اصلی نمایش داده نمی‌شوند
              </p>
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <GlassButton
                type="button"
                variant="white"
                size="md"
                onClick={() => navigate("/admin/partners")}
              >
                انصراف
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                size="md"
                loading={submitting || uploading}
                icon={<Save className="w-5 h-5" />}
                iconPosition="left"
                disabled={submitting || uploading}
                className="flex-1"
              >
                {uploading ? "در حال آپلود..." : "ذخیره تغییرات"}
              </GlassButton>
            </div>
          </form>
        </LiquidGlassCard>
      </div>
    </AdminLayout>
  );
}
