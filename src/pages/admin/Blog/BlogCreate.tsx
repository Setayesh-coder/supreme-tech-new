// src/pages/admin/Blog/BlogCreate.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { blogAPI, generateSlug } from "../../../lib/api/blog";
import { uploadAPI } from "../../../lib/api/upload";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../../components/ui/GlassButton";
import { BlogEditor } from "../../../components/admin/BlogEditor";
import { ArrowLeft, Save, X, Plus, Upload, Loader2 } from "lucide-react";

export default function BlogCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("لطفاً یک فایل تصویری انتخاب کنید");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم تصویر نباید بیشتر از ۵ مگابایت باشد");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview("");
    const input = document.getElementById("image-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  // ✅ اصلاح: استفاده از uploadAPI.uploadImage
  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      const response = await uploadAPI.uploadImage(file, "blog");
      // console.log("✅ تصویر آپلود شد:", response.url);
      return response.url;
    } catch (error: any) {
      console.error("❌ خطا در آپلود:", error);

      // ✅ نمایش خطای دقیق از بک‌اند
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        throw new Error(detail.map((e: any) => e.msg).join(", "));
      }
      throw new Error(
        detail || error.response?.data?.message || "خطا در آپلود تصویر",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let coverImageUrl = null;

      // ✅ آپلود تصویر اگر انتخاب شده باشد
      if (image) {
        try {
          coverImageUrl = await uploadImage(image);
        } catch (uploadError: any) {
          setError(uploadError.message || "خطا در آپلود تصویر");
          setLoading(false);
          return;
        }
      }

      const data = {
        title: title.trim(),
        slug: generateSlug(title.trim()),
        content: content,
        summary: summary.trim() || null,
        cover_image: coverImageUrl,
        tags: tags,
        published: published,
      };

      // console.log("📤 ارسال داده برای ایجاد پست:", data);

      await blogAPI.create(data);

      // ✅ پیام موفقیت
      alert("✅ پست با موفقیت ایجاد شد!");
      navigate("/admin/blog");
    } catch (err: any) {
      console.error("❌ خطا:", err);

      // ✅ نمایش خطای دقیق
      let errorMessage = "خطا در ایجاد پست";
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
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/blog")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">✏️ ایجاد پست جدید</h1>
        </div>

        <LiquidGlassCard
          className="p-6 md:p-8"
          borderRadius="16px"
          blurIntensity="lg"
          glowIntensity="md"
        >
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 whitespace-pre-wrap">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* تصویر کاور */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                تصویر کاور
              </label>
              <div className="flex flex-col gap-2">
                {imagePreview ? (
                  <div className="relative w-full">
                    <img
                      src={imagePreview}
                      alt="پیش‌نمایش"
                      className="w-full h-48 object-cover rounded-xl border border-white/20"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-image.jpg";
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                    <p className="text-xs text-gray-400 mt-1">
                      {image ? `🆕 ${image.name}` : "تصویر"}
                    </p>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-white/20 border-dashed rounded-xl cursor-pointer hover:border-blue-500/50 transition-colors bg-white/5 hover:bg-white/10">
                    <div className="flex flex-col items-center justify-center py-4">
                      {uploading ? (
                        <>
                          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-2" />
                          <p className="text-sm text-blue-400">
                            در حال آپلود...
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-400">
                            برای آپلود کلیک کنید
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, WEBP (حداکثر ۵MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      id="image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* عنوان */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                عنوان <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="عنوان پست"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚡ اسلاگ به صورت خودکار از عنوان تولید می‌شود
              </p>
            </div>

            {/* خلاصه */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                خلاصه
              </label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="خلاصه پست"
              />
            </div>

            {/* تگ‌ها */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                تگ‌ها
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddTag())
                  }
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="تگ جدید..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus size={18} />
                  افزودن
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.length === 0 && (
                  <p className="text-xs text-gray-500">هیچ تگی اضافه نشده</p>
                )}
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm text-gray-300 flex items-center gap-2"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* محتوا */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                محتوا <span className="text-red-400">*</span>
              </label>
              <BlogEditor value={content} onChange={setContent} />
            </div>

            {/* انتشار */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 accent-blue-500"
                />
                منتشر شود
              </label>
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <GlassButton
                type="button"
                variant="white"
                size="md"
                onClick={() => navigate("/admin/blog")}
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
                className="flex-1"
              >
                {uploading
                  ? "در حال آپلود تصویر..."
                  : loading
                    ? "در حال ایجاد..."
                    : "ایجاد پست"}
              </GlassButton>
            </div>
          </form>
        </LiquidGlassCard>
      </div>
    </AdminLayout>
  );
}
