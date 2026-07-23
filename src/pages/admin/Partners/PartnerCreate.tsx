// src/pages/admin/Partners/PartnerCreate.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { partnersAPI } from "../../../lib/api/partners";
import { uploadAPI } from "../../../lib/api/upload";
import { ArrowLeft, Save, X,  Loader2, Building2 } from "lucide-react";

export default function PartnerCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    const input = document.getElementById("logo-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      setUploading(true);
      const response = await uploadAPI.uploadImage(formData);
      return response.url;
    } catch (error) {
      throw new Error("خطا در آپلود لوگو");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let logoUrl = "";
      if (logo) {
        logoUrl = await uploadLogo(logo);
      }

      const partnerData = {
        ...formData,
        order: Number(formData.order),
        logo: logoUrl,
      };

      await partnersAPI.create(partnerData);
      navigate("/admin/partners");
    } catch (err: any) {
      setError(err.response?.data?.error || "خطا در ایجاد همکار");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-white">➕ ایجاد همکار جدید</h1>
        </div>

        <LiquidGlassCard
          className="p-6 md:p-8"
          borderRadius="16px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* لوگو */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                لوگو
              </label>
              {logoPreview ? (
                <div className="relative w-32 h-32">
                  <img
                    src={logoPreview}
                    alt="پیش‌نمایش لوگو"
                    className="w-32 h-32 object-contain rounded-xl border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
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
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, SVG (حداکثر ۲MB)
              </p>
            </div>

            {/* نام */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                نام همکار
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="https://example.com"
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
            </div>

            {/* فعال */}
            <div className="flex items-center gap-4">
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
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-4">
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
                loading={loading || uploading}
                icon={<Save className="w-5 h-5" />}
                iconPosition="left"
                disabled={loading || uploading}
              >
                {uploading ? "در حال آپلود..." : "ایجاد همکار"}
              </GlassButton>
            </div>
          </form>
        </LiquidGlassCard>
      </div>
    </AdminLayout>
  );
}
