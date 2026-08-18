// src/components/payment/CardToCardPayment.tsx

import { useState } from "react";
import { GlassButton } from "../ui/GlassButton";
import { Upload } from "lucide-react";

interface CardToCardPaymentProps {
  enrollmentId: string;
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
}

export default function CardToCardPayment({
  enrollmentId: _enrollmentId,
  amount,
  onSuccess,
  onBack,
}: CardToCardPaymentProps) {
  const [trackingCode, setTrackingCode] = useState("");
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("حجم عکس نباید بیشتر از ۲ مگابایت باشد");
        return;
      }
      setReceiptImage(file);
      setReceiptPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!trackingCode.trim()) {
      setError("لطفاً کد پیگیری را وارد کنید");
      return;
    }
    if (!receiptImage) {
      setError("لطفاً تصویر رسید را آپلود کنید");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // TODO: ارسال به سرور
      // await paymentsAPI.submitCardToCard({
      //   enrollmentId,
      //   trackingCode,
      //   receiptImage,
      // });

      alert("✅ اطلاعات پرداخت با موفقیت ثبت شد. منتظر تایید ادمین باشید.");
      onSuccess();
    } catch (err) {
      setError("خطا در ثبت اطلاعات پرداخت");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-sm text-gray-300">
          لطفاً مبلغ {amount.toLocaleString()} تومان را به شماره کارت زیر واریز
          کنید:
        </p>
        <p className="text-xl font-bold text-white text-center mt-2 font-mono tracking-widest">
          6037-9918-1234-5678
        </p>
        <p className="text-xs text-gray-500 text-center mt-1">
          بانک ملی - به نام شرکت Supreme Tech
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">
          کد پیگیری
        </label>
        <input
          type="text"
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
          placeholder="کد پیگیری را وارد کنید"
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">
          تصویر رسید
        </label>
        <div className="flex items-center gap-4">
          <label className="flex-1 flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-xl cursor-pointer hover:bg-white/20 transition-colors">
            <Upload className="w-5 h-5 text-gray-400 ml-2" />
            <span className="text-gray-400 text-sm">
              {receiptImage ? receiptImage.name : "آپلود تصویر"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {receiptPreview && (
            <img
              src={receiptPreview}
              alt="رسید"
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <GlassButton
          type="button"
          variant="white"
          size="md"
          onClick={onBack}
          className="flex-1"
        >
          بازگشت
        </GlassButton>
        <GlassButton
          type="button"
          variant="primary"
          size="md"
          loading={loading}
          disabled={loading}
          onClick={handleSubmit}
          className="flex-1"
        >
          {loading ? "در حال ثبت..." : "ثبت پرداخت"}
        </GlassButton>
      </div>
    </div>
  );
}
