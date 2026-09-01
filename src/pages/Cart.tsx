// src/pages/Cart.tsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { CartTab } from "../components/profile/CartTab";
import { LiquidGlassCard } from "../components/ui/LiquidGlassCard";
import { GlassButton } from "../components/ui/GlassButton";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { enrollmentsAPI } from "../lib/api/enrollments";

// ✅ کامپوننت Confirm Dialog
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "تأیید",
  cancelText = "انصراف",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <LiquidGlassCard
        className="p-6 max-w-md w-full mx-4"
        borderRadius="24px"
        blurIntensity="xl"
        glowIntensity="md"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-full">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-400 text-sm mb-6">{description}</p>
        <div className="flex gap-3">
          <GlassButton
            variant="secondary"
            size="md"
            fullWidth
            onClick={onClose}
          >
            {cancelText}
          </GlassButton>
          <GlassButton
            variant="danger"
            size="md"
            fullWidth
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
          >
            {confirmText}
          </GlassButton>
        </div>
      </LiquidGlassCard>
    </div>
  );
};

export default function Cart() {
  const navigate = useNavigate();
  const { refetch } = useCart();

  // ✅ State برای Confirm Dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // ✅ تابع حذف با Confirm
  const handleRemoveFromCart = useCallback(async (enrollmentId: string) => {
    // ✅ باز کردن Confirm Dialog
    setDeleteTargetId(enrollmentId);
    setShowConfirmDialog(true);
  }, []);

  // ✅ تایید حذف
  const confirmDelete = useCallback(async () => {
    if (!deleteTargetId) return;

    try {
      await enrollmentsAPI.cancel(deleteTargetId);
      await refetch();
      toast.success("✅ آیتم از سبد خرید حذف شد");
    } catch (err: any) {
      console.error("❌ خطا در حذف:", err);
      toast.error(err.response?.data?.detail || "❌ خطا در حذف آیتم");
    } finally {
      setShowConfirmDialog(false);
      setDeleteTargetId(null);
    }
  }, [deleteTargetId, refetch]);

  // ✅ بستن دیالوگ
  const handleCancelDelete = useCallback(() => {
    setShowConfirmDialog(false);
    setDeleteTargetId(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-8 px-4 pt-24">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          بازگشت
        </button>

        {/* <LiquidGlassCard
          className="p-6"
          borderRadius="24px"
          blurIntensity="xl"
          glowIntensity="md"
        > */}
        <CartTab
          standalone
          onRemoveFromCart={handleRemoveFromCart}
          onRefresh={refetch}
        />
        {/* </LiquidGlassCard> */}
      </div>

      {/* ✅ Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onClose={handleCancelDelete}
        onConfirm={confirmDelete}
        title="حذف از سبد خرید"
        description="آیا از حذف این آیتم از سبد خرید مطمئن هستید؟"
        confirmText="حذف"
        cancelText="انصراف"
      />
    </div>
  );
}
