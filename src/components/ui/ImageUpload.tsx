// src/components/ui/ImageUpload.tsx
import { useState } from "react";
import { uploadAPI } from "../../lib/api/upload";
import { Loader2, Upload, X } from "lucide-react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  folder?: string;
  accept?: string;
  maxSize?: number; // به مگابایت
  label?: string;
  existingImage?: string;
}

export default function ImageUpload({
  onUpload,
  folder = "general",
  accept = "image/*",
  maxSize = 5,
  label = "انتخاب تصویر",
  existingImage,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(existingImage || "");
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ بررسی نوع فایل
    if (!file.type.startsWith("image/")) {
      setError("لطفاً یک فایل تصویری انتخاب کنید");
      return;
    }

    // ✅ بررسی حجم فایل
    if (file.size > maxSize * 1024 * 1024) {
      setError(`حجم تصویر نباید بیشتر از ${maxSize} مگابایت باشد`);
      return;
    }

    setError("");
    setUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      const response = await uploadAPI.uploadImage(file, folder);
      onUpload(response.url);
    } catch (err) {
      setError("خطا در آپلود تصویر");
      setPreview("");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview("");
    onUpload("");
    const input = document.getElementById("image-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  return (
    <div className="space-y-2">
      {error && <div className="text-red-400 text-sm">❌ {error}</div>}

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="پیش‌نمایش"
            className="w-full h-48 object-cover rounded-xl"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-white/20 border-dashed rounded-xl cursor-pointer hover:border-blue-500/50 transition-colors bg-white/5 hover:bg-white/10">
          <div className="flex flex-col items-center justify-center py-4">
            {uploading ? (
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-2" />
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-400">{label}</p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP (حداکثر {maxSize}MB)
                </p>
              </>
            )}
          </div>
          <input
            id="image-input"
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
