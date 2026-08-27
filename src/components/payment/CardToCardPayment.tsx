// src/components/payment/CardToCardPayment.tsx
import { useState } from "react";
import { GlassButton } from "../ui/GlassButton";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { ArrowRight, Upload, AlertCircle } from "lucide-react";
import { paymentsAPI } from "../../lib/api/payment";
import { uploadAPI } from "../../lib/api/upload";
import { BankCard } from "../ui/BankCard";

interface CardToCardPaymentProps {
  enrollmentId: string;
  amount: number;
  originalAmount?: number; // ✅ اضافه کردن قیمت اصلی
  discountAmount?: number; // ✅ اضافه کردن مبلغ تخفیف
  couponCode?: string; // ✅ اضافه کردن کد تخفیف
  onSuccess: () => void;
  onBack: () => void;
}

// ✅ اطلاعات کارت بلو بانک
const BANK_CARD_INFO = {
  number: "6219 8619 2683 6163",
  holderName: "محمد علیزاده",
};

export default function CardToCardPayment({
  enrollmentId,
  amount,
  originalAmount,
  discountAmount = 0,
  couponCode,
  onSuccess,
  onBack,
}: CardToCardPaymentProps) {
  const [trackingCode, setTrackingCode] = useState("");
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم تصویر نباید بیشتر از 5 مگابایت باشد");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("لطفاً یک تصویر معتبر انتخاب کنید");
        return;
      }
      setReceiptImage(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTrackingCode = trackingCode.replace(/[^0-9]/g, "");
    if (!cleanTrackingCode || cleanTrackingCode.length < 5) {
      setError("کد پیگیری باید حداقل 5 عدد باشد (فقط اعداد انگلیسی)");
      return;
    }

    if (!receiptImage) {
      setError("لطفاً تصویر رسید را آپلود کنید");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      console.log("📤 آپلود تصویر رسید...");
      const uploadResult = await uploadAPI.uploadImage(
        receiptImage,
        "receipts",
      );
      console.log("✅ تصویر آپلود شد:", uploadResult);
      setUploadProgress(50);

      const imageUrl = uploadResult.url;

      console.log("📤 ارسال به سرور:", {
        enrollment_id: enrollmentId,
        tracking_code: cleanTrackingCode,
        receipt_image_url: imageUrl,
        amount: amount, // ✅ ارسال مبلغ نهایی با تخفیف
        original_amount: originalAmount,
        discount_amount: discountAmount,
        coupon_code: couponCode,
      });

      await paymentsAPI.cardToCardPayment({
        enrollment_id: enrollmentId,
        tracking_code: cleanTrackingCode,
        receipt_image_url: imageUrl,
        amount: amount, // ✅ ارسال مبلغ نهایی
      });

      setUploadProgress(100);
      setSuccess("✅ پرداخت کارت به کارت با موفقیت ثبت شد!");
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      console.error("❌ خطا در پرداخت کارت به کارت:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "خطا در پرداخت کارت به کارت",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  };

  // ✅ محاسبه تخفیف اعمال شده
  const hasDiscount = discountAmount > 0;

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت
      </button>

      {/* ✅ کارت بلو بانک */}
      <div className="flex justify-center px-4">
        <BankCard
          cardNumber={BANK_CARD_INFO.number}
          cardHolderName={BANK_CARD_INFO.holderName}
        />
      </div>

      {/* توضیحات و فرم */}
      <LiquidGlassCard
        className="p-4"
        borderRadius="16px"
        blurIntensity="sm"
        glowIntensity="sm"
      >
        <h3 className="text-white font-bold mb-2 text-center">
          پرداخت کارت به کارت
        </h3>

        {/* ✅ نمایش قیمت با تخفیف */}
        <div className="text-center mb-4">
          {hasDiscount ? (
            <>
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-400 text-sm line-through">
                  {formatPrice(originalAmount || amount)}
                </span>
                <span className="text-green-400 text-sm font-medium">
                  -{formatPrice(discountAmount)}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatPrice(amount)}
              </div>
              {couponCode && (
                <div className="text-xs text-green-400 mt-1">
                  ✅ کد تخفیف: {couponCode}
                </div>
              )}
            </>
          ) : (
            <div className="text-2xl font-bold text-white">
              {formatPrice(amount)}
            </div>
          )}
          <p className="text-gray-400 text-xs mt-1">مبلغ قابل پرداخت</p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
          <p className="text-yellow-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              لطفاً پس از واریز مبلغ به حساب، کد پیگیری و تصویر رسید را وارد
              کنید:
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              کد پیگیری
            </label>
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setTrackingCode(value);
              }}
              placeholder="کد پیگیری را وارد کنید..."
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              تصویر رسید
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-400 file:text-sm hover:file:bg-blue-500/30"
                disabled={loading}
              />
              {receiptImage && (
                <p className="text-green-400 text-xs mt-1">
                  {receiptImage.name} ({(receiptImage.size / 1024).toFixed(1)}{" "}
                  KB)
                </p>
              )}
            </div>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-2 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl text-sm">
              {success}
            </div>
          )}

          <GlassButton
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={loading}
            disabled={loading}
            icon={<Upload className="w-4 h-4" />}
            iconPosition="left"
          >
            {loading ? "در حال ثبت..." : "ثبت پرداخت"}
          </GlassButton>
        </form>
      </LiquidGlassCard>
    </div>
  );
}
