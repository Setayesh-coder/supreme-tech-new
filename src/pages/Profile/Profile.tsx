// src/pages/Profile/Profile.tsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../../lib/api/users";
import {
  enrollmentsAPI,
  type Enrollment as APIEnrollment,
} from "../../lib/api/enrollments";
// import { cartAPI } from "../../lib/api/cart";
import { useCart } from "../../hooks/useCart";
import { ticketsAPI, type Ticket } from "../../lib/api/tickets";
import { messagesAPI, type Message } from "../../lib/api/messages";
import { uploadAPI } from "../../lib/api/upload";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { toast } from "../../hooks/use-toast";
import {
  ProfileHeader,
  ProfileTabs,
  ProfileInfo,
  EnrollmentsTab,
  CartTab,
  TicketsTab,
  PaymentModal,
} from "../../components/profile";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  MessageSquare,
  Mail,
  Camera,
  X,
  User,
} from "lucide-react";
import { authAPI } from "../../lib/api";

// ============================================================
// ✅ تایپ‌ها
// ============================================================
interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone: string;
  province?: string;
  birthDate?: string;
  gender?: string;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

interface Enrollment extends APIEnrollment {
  eventId: string;
  course: {
    id: string;
    title: string;
    slug: string;
    date: string;
    image?: string;
    price: number;
    duration?: string;
    meetingLink?: string;
  };
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "WAITING_VERIFY";
  meetingLink?: string;
  createdAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "WAITING" | "ATTENDED";
}

interface MessageReply {
  id: string;
  messageId: string;
  message: {
    subject: string;
    message: string;
    createdAt: string;
  };
  reply: string;
  sentAt: string;
}

// ============================================================
// ✅ کامپوننت Confirm Dialog
// ============================================================
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
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
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
          >
            {confirmText}
          </GlassButton>
        </div>
      </LiquidGlassCard>
    </div>
  );
};

// ============================================================
// ✅ کامپوننت پاسخ‌های پیام‌ها
// ============================================================
function RepliesTab({
  replies,
  loading,
  formatDate,
}: {
  replies: MessageReply[];
  loading: boolean;
  formatDate: (date: string) => string;
}) {
  if (loading) {
    return (
      <LiquidGlassCard
        className="p-8 text-center"
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="md"
      >
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
        <p className="text-gray-400 mt-4">دریافت پاسخ‌ها...</p>
      </LiquidGlassCard>
    );
  }

  if (replies.length === 0) {
    return (
      <LiquidGlassCard
        className="p-8 text-center"
        borderRadius="20px"
        blurIntensity="lg"
        glowIntensity="md"
      >
        <Mail className="w-16 h-16 mx-auto mb-4 text-white/20" />
        <p className="text-gray-400">هنوز پاسخی دریافت نکرده‌اید</p>
        <p className="text-gray-500 text-sm mt-1">
          پاسخ به پیام‌های شما در این بخش نمایش داده می‌شود
        </p>
      </LiquidGlassCard>
    );
  }

  return (
    <LiquidGlassCard
      className="p-6"
      borderRadius="20px"
      blurIntensity="lg"
      glowIntensity="md"
    >
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-blue-400" />
        پاسخ‌های تیم
        <span className="text-sm text-gray-400 font-normal mr-2">
          ({replies.length})
        </span>
      </h2>

      <div className="space-y-4">
        {replies.map((reply) => (
          <LiquidGlassCard
            key={reply.id}
            className="p-4 hover:bg-white/5 transition-all duration-300"
            borderRadius="14px"
            blurIntensity="sm"
            glowIntensity="sm"
          >
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <h3 className="text-white font-bold">
                  {reply.message.subject}
                </h3>
                <span className="text-xs text-gray-500">
                  {formatDate(reply.sentAt)}
                </span>
              </div>

              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-gray-400 text-sm">
                  <span className="text-gray-500">پیام شما:</span>
                  <br />
                  {reply.message.message}
                </p>
              </div>

              <div className="bg-blue-500/10 rounded-xl p-3 border-r-2 border-blue-400">
                <p className="text-white text-sm">
                  <span className="text-blue-400">پاسخ تیم:</span>
                  <br />
                  {reply.reply}
                </p>
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    </LiquidGlassCard>
  );
}

// ============================================================
// ✅ کامپوننت اصلی Profile
// ============================================================
export default function Profile() {
  const navigate = useNavigate();

  // ============== States ==============
  const [user, setUser] = useState<UserProfile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [replies, setReplies] = useState<MessageReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    province: "",
    birthDate: "",
    gender: "",
    avatar: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "enrollments" | "cart" | "tickets" | "replies"
  >("enrollments");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  // Refs برای جلوگیری از رندرهای اضافی
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);

  // ============== Hooks ==============
  const {
    items: hookCart,
    // displayItems: hookDisplayItems,
    isLoading: hookLoading,
    refetch: refetchCart,
  } = useCart();

  // ============== Helper Functions ==============
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "نامشخص";
    try {
      return new Date(dateString).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "نامشخص";
    }
  }, []);

  const formatPrice = useCallback((price: number) => {
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  }, []);

  const getStatusLabel = useCallback((status: string) => {
    const labels: Record<
      string,
      { label: string; icon: React.ReactElement; color: string }
    > = {
      PENDING: {
        label: "در انتظار تایید",
        icon: <AlertCircle size={14} />,
        color: "text-yellow-400",
      },
      CONFIRMED: {
        label: "تایید شده",
        icon: <CheckCircle size={14} />,
        color: "text-green-400",
      },
      CANCELLED: {
        label: "لغو شده",
        icon: <XCircle size={14} />,
        color: "text-red-400",
      },
      WAITING: {
        label: "در لیست انتظار",
        icon: <Clock size={14} />,
        color: "text-orange-400",
      },
      ATTENDED: {
        label: "حضور یافته",
        icon: <CheckCircle size={14} />,
        color: "text-blue-400",
      },
    };
    return (
      labels[status] || {
        label: status,
        icon: <AlertCircle size={14} />,
        color: "text-gray-400",
      }
    );
  }, []);

  const getPaymentStatusLabel = useCallback((status?: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      PENDING: { label: "در انتظار پرداخت", color: "text-yellow-400" },
      PAID: { label: "پرداخت شده", color: "text-green-400" },
      FAILED: { label: "ناموفق", color: "text-red-400" },
      WAITING_VERIFY: { label: "در انتظار تایید", color: "text-blue-400" },
    };
    return (
      labels[status || "PENDING"] || {
        label: "در انتظار پرداخت",
        color: "text-yellow-400",
      }
    );
  }, []);

  // ============== Fetch Functions ==============
  const fetchTickets = useCallback(async () => {
    if (!isMounted.current) return;
    setTicketsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setTickets([]);
        return;
      }
      const data = await ticketsAPI.getMyTickets();
      if (isMounted.current) {
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      console.error("❌ خطا در دریافت تیکت‌ها:", err);
      if (isMounted.current) {
        toast.error("خطا در دریافت تیکت‌ها");
      }
    } finally {
      if (isMounted.current) {
        setTicketsLoading(false);
      }
    }
  }, []);

  const fetchReplies = useCallback(async () => {
    if (!user?.id || !isMounted.current) return;
    setRepliesLoading(true);
    try {
      const response = await messagesAPI.getAll();
      const allMessages = response.items || [];
      const mappedReplies: MessageReply[] = allMessages
        .filter((msg: Message) => msg.reply)
        .map((msg: Message) => ({
          id: msg.id,
          messageId: msg.id,
          message: {
            subject: msg.project_type || "پیام",
            message: msg.project_description || "",
            createdAt: msg.created_at,
          },
          reply: msg.reply || "",
          sentAt: msg.replied_at || msg.created_at,
        }));
      if (isMounted.current) {
        setReplies(mappedReplies);
      }
    } catch (err) {
      console.error("❌ خطا در دریافت پاسخ‌ها:", err);
      if (isMounted.current) {
        setReplies([]);
      }
    } finally {
      if (isMounted.current) {
        setRepliesLoading(false);
      }
    }
  }, [user?.id]);

  const fetchProfile = useCallback(async () => {
    // جلوگیری از درخواست‌های همزمان
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // دریافت پروفایل
      try {
        const profileData = await usersAPI.getMyProfile();
        if (profileData && isMounted.current) {
          setUser(profileData);
          setFormData({
            name: profileData.name || "",
            email: profileData.email || "",
            phone: profileData.phone || "",
            province: profileData.province || "",
            birthDate: profileData.birthDate || "",
            gender: profileData.gender || "",
            avatar: profileData.avatar || "",
          });
          setAvatarPreview(profileData.avatar || "");
        }
      } catch (err: any) {
        console.error("❌ خطا در دریافت پروفایل:", err);
        if (err?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        if (isMounted.current) {
          toast.error("خطا در دریافت اطلاعات کاربر");
        }
      }

      // دریافت ثبت‌نام‌ها
      try {
        const enrollmentsData = await enrollmentsAPI.getMyEnrollments();
        if (isMounted.current) {
          const mappedEnrollments: Enrollment[] = enrollmentsData.map(
            (item: any) => {
              const courseId = item.course_id || item.eventId || item.id;
              const courseInfo = item.event || item.course || {};
              return {
                ...item,
                id: item.id || `enr_${Date.now()}`,
                eventId: item.eventId || item.event_id || courseId,
                paymentStatus:
                  item.status === "PENDING" ? "PENDING" : undefined,
                createdAt:
                  item.createdAt || item.created_at || new Date().toISOString(),
                status: item.status || "PENDING",
                event: {
                  id: courseId,
                  title: courseInfo.title || item.title || "دوره آموزشی",
                  slug: courseInfo.slug || item.slug || "",
                  date:
                    courseInfo.date ||
                    item.date ||
                    item.created_at ||
                    new Date().toISOString(),
                  price: courseInfo.price || item.price || 0,
                  image:
                    courseInfo.image ||
                    courseInfo.cover_image ||
                    item.image ||
                    "",
                  duration: courseInfo.duration || "",
                  meetingLink: courseInfo.meetingLink || "",
                },
                course: {
                  id: courseId,
                  title: courseInfo.title || item.title || "دوره آموزشی",
                  slug: courseInfo.slug || item.slug || "",
                  date:
                    courseInfo.date ||
                    item.date ||
                    item.created_at ||
                    new Date().toISOString(),
                  price: courseInfo.price || item.price || 0,
                  image:
                    courseInfo.image ||
                    courseInfo.cover_image ||
                    item.image ||
                    "",
                  duration: courseInfo.duration || "",
                  meetingLink: courseInfo.meetingLink || "",
                },
              };
            },
          );
          setEnrollments(mappedEnrollments);
        }
      } catch (err) {
        console.error("❌ خطا در دریافت ثبت‌نام‌ها:", err);
        if (isMounted.current) {
          toast.error("خطا در دریافت ثبت‌نام‌ها");
          setEnrollments([]);
        }
      }

      // دریافت سبد خرید با React Query
      await refetchCart();

      // دریافت تیکت‌ها
      await fetchTickets();

      // دریافت پاسخ‌ها
      if (user?.id) {
        await fetchReplies();
      }
    } catch (err: any) {
      console.error("❌ خطا در fetchProfile:", err);
      if (isMounted.current) {
        toast.error("خطا در بارگذاری اطلاعات");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      fetchInProgress.current = false;
    }
  }, [navigate, refetchCart, fetchTickets, fetchReplies, user?.id]);

  // ============== useEffect ==============
  useEffect(() => {
    isMounted.current = true;
    fetchProfile();

    return () => {
      isMounted.current = false;
    };
  }, [fetchProfile]);

  // ============== Profile Functions ==============
  const handleEdit = useCallback(() => {
    setEditing(true);
    setError("");
    setSuccess("");
  }, []);

  const handleCancel = useCallback(() => {
    setEditing(false);
    setAvatarFile(null);
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        province: user.province || "",
        birthDate: user.birthDate || "",
        gender: user.gender || "",
        avatar: user.avatar || "",
      });
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file, "avatars");
      return response.url;
    } catch (error) {
      console.error("❌ خطا در آپلود آواتار:", error);
      throw new Error("خطا در آپلود تصویر");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // اعتبارسنجی فایل
      if (!file.type.startsWith("image/")) {
        toast.error("لطفاً یک فایل تصویری انتخاب کنید");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم فایل نباید بیشتر از ۵ مگابایت باشد");
        return;
      }

      try {
        const imageUrl = await uploadAvatar(file);
        const updatedUser = await usersAPI.updateMyProfile({
          avatar: imageUrl,
        });
        setUser(updatedUser);
        setAvatarPreview(imageUrl);
        toast.success("آواتار با موفقیت بروزرسانی شد");
      } catch (error) {
        console.error("❌ خطا در آپلود آواتار:", error);
        toast.error("خطا در آپلود تصویر");
      }
    },
    [uploadAvatar],
  );

  const handleRemoveAvatar = useCallback(() => {
    setAvatarFile(null);
    setAvatarPreview(user?.avatar || "");
  }, [user?.avatar]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let avatarUrl = formData.avatar;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      const updateData: any = {};
      if (formData.name !== user?.name && formData.name?.trim())
        updateData.name = formData.name.trim();
      if (formData.email !== user?.email && formData.email?.trim())
        updateData.email = formData.email.trim();
      if (formData.phone !== user?.phone && formData.phone?.trim())
        updateData.phone = formData.phone.trim();
      if (formData.province !== user?.province && formData.province?.trim())
        updateData.province = formData.province.trim();
      if (formData.birthDate && formData.birthDate.trim())
        updateData.birthDate = formData.birthDate.trim();
      if (formData.gender && formData.gender.trim())
        updateData.gender = formData.gender.trim();
      if (avatarUrl !== user?.avatar && avatarUrl)
        updateData.avatar = avatarUrl;

      if (Object.keys(updateData).length === 0) {
        setSuccess("هیچ تغییری اعمال نشد");
        setEditing(false);
        setSaving(false);
        return;
      }

      const updatedUser = await authAPI.updateProfile(updateData);
      setUser(updatedUser);
      setSuccess("✅ اطلاعات با موفقیت بروزرسانی شد");
      setEditing(false);
      setAvatarFile(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "خطا در بروزرسانی",
      );
    } finally {
      setSaving(false);
    }
  }, [formData, user, avatarFile, uploadAvatar]);

  // ============== Logout ==============
  const handleLogoutClick = useCallback(() => {
    setConfirmAction({
      title: "خروج از حساب کاربری",
      description: "آیا از خروج از حساب کاربری مطمئن هستید؟",
      onConfirm: () => {
        localStorage.removeItem("token");
        navigate("/login");
        toast.info("با موفقیت خارج شدید");
      },
    });
    setShowConfirmDialog(true);
  }, [navigate]);

  // ============== Payment Functions ==============
  const processPayment = useCallback(async () => {
    if (!selectedEnrollment) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await enrollmentsAPI.processPayment(selectedEnrollment.id);

      if (result.paymentUrl) {
        window.open(result.paymentUrl, "_blank");
        setSuccess("✅ لینک پرداخت باز شد");
        setShowPayment(false);
        setSelectedEnrollment(null);
      } else {
        setSuccess("✅ پرداخت با موفقیت انجام شد!");
        await fetchProfile();
        setShowPayment(false);
        setSelectedEnrollment(null);
      }
      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "خطا در پردازش پرداخت");
    } finally {
      setSaving(false);
    }
  }, [selectedEnrollment, fetchProfile]);

  // ============== Cart Functions ==============
  // src/pages/Profile/Profile.tsx
  // در بخش handleRemoveFromCart:

  const handleRemoveFromCart = useCallback(
    async (enrollmentId: string) => {
      setConfirmAction({
        title: "حذف از سبد خرید",
        description: "آیا از حذف این آیتم از سبد خرید مطمئن هستید؟",
        onConfirm: async () => {
          try {
            // ✅ حذف از API
            await enrollmentsAPI.cancel(enrollmentId);

            // ✅ رفرش سبد خرید با React Query
            await refetchCart();

            // ✅ رفرش کل پروفایل برای به‌روزرسانی همه داده‌ها
            await fetchProfile();

            toast.success("✅ آیتم از سبد خرید حذف شد");
          } catch (err: any) {
            console.error("❌ خطا در حذف از سبد خرید:", err);
            toast.error(
              err.response?.data?.detail || err.message || "خطا در حذف آیتم",
            );
          }
        },
      });
      setShowConfirmDialog(true);
    },
    [refetchCart, fetchProfile],
  );
  // ============== Ticket Functions ==============
  const handleCreateTicket = useCallback(() => {
    navigate("/tickets/create");
  }, [navigate]);

  const handleViewTicket = useCallback(
    (id: string) => {
      navigate(`/tickets/${id}`);
    },
    [navigate],
  );

  const handleDeleteTicket = useCallback(async (id: string) => {
    setConfirmAction({
      title: "حذف تیکت",
      description: "آیا از حذف این تیکت مطمئن هستید؟",
      onConfirm: async () => {
        try {
          await ticketsAPI.delete(id);
          setTickets((prev) => prev.filter((t) => t.id !== id));
          toast.success("✅ تیکت با موفقیت حذف شد");
        } catch (err) {
          toast.error("خطا در حذف تیکت");
        }
      },
    });
    setShowConfirmDialog(true);
  }, []);

  // ============== Stats ==============
  const stats = useMemo(
    () => ({
      totalEnrollments: enrollments.length,
      confirmedEnrollments: enrollments.filter((e) => e.status === "CONFIRMED")
        .length,
      pendingEnrollments: enrollments.filter((e) => e.status === "PENDING")
        .length,
      attendedEnrollments: enrollments.filter((e) => e.status === "CANCELLED")
        .length,
      cartCount: hookCart.length, // ✅ استفاده از items به جای cart
      ticketCount: tickets.length,
      repliesCount: replies.length,
    }),
    [enrollments, hookCart.length, tickets.length, replies.length],
  );

  // ============== Loading State ==============
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
          <p className="text-blue-400/60 text-sm animate-pulse">بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
        <LiquidGlassCard
          className="p-8 text-center max-w-sm"
          borderRadius="24px"
        >
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-bold text-white mb-2">کاربری یافت نشد</h3>
          <p className="text-gray-400 mb-6">لطفاً دوباره وارد شوید</p>
          <GlassButton variant="primary" onClick={() => navigate("/login")}>
            ورود به حساب
          </GlassButton>
        </LiquidGlassCard>
      </div>
    );
  }

  // ============== Render ==============
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-8 px-4 md:py-12 pt-24 md:pt-28">
      <div className="max-w-6xl mx-auto">
        {/* Avatar Section */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden ring-4 ring-blue-500/30">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user.name || "کاربر"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "";
                  }}
                />
              ) : (
                <User className="w-16 h-16 text-white/80" />
              )}
            </div>
            {editing && (
              <>
                <label className="absolute bottom-0 right-0 p-2.5 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {avatarFile && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute bottom-0 left-0 p-2.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Header */}
        <ProfileHeader
          user={user}
          cartCount={stats.cartCount}
          onLogout={handleLogoutClick}
          onCartClick={() => navigate("/cart")}
        />

        {/* Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          cartCount={stats.cartCount}
          ticketCount={stats.ticketCount}
        />

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProfileInfo
              user={user}
              formData={formData}
              editing={editing}
              saving={saving}
              error={error}
              success={success}
              onEdit={handleEdit}
              onCancel={handleCancel}
              onSave={handleSave}
              onChange={handleChange}
              onLogout={handleLogoutClick}
            />
          </div>

          <div className="lg:col-span-2">
            {activeTab === "enrollments" && (
              <EnrollmentsTab
                enrollments={enrollments}
                navigate={navigate}
                formatDate={formatDate}
                formatPrice={formatPrice}
                getStatusLabel={getStatusLabel}
                getPaymentStatusLabel={getPaymentStatusLabel}
              />
            )}

            {activeTab === "cart" && (
              <CartTab
                externalCart={hookCart} // ✅ استفاده از hookCart
                externalLoading={hookLoading}
                onRefresh={fetchProfile}
                standalone={false}
                onRemoveFromCart={handleRemoveFromCart}
              />
            )}

            {activeTab === "tickets" && (
              <TicketsTab
                tickets={tickets}
                loading={ticketsLoading}
                onCreateTicket={handleCreateTicket}
                onViewTicket={handleViewTicket}
                onDeleteTicket={handleDeleteTicket}
              />
            )}

            {activeTab === "replies" && (
              <RepliesTab
                replies={replies}
                loading={repliesLoading}
                formatDate={formatDate}
              />
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && selectedEnrollment && (
        <PaymentModal
          selectedEnrollment={selectedEnrollment}
          saving={saving}
          error={error}
          success={success}
          formatPrice={formatPrice}
          onClose={() => {
            setShowPayment(false);
            setSelectedEnrollment(null);
            setError("");
            setSuccess("");
          }}
          onConfirm={processPayment}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction.onConfirm();
          }
        }}
        title={confirmAction?.title || "تأیید"}
        description={confirmAction?.description || "آیا مطمئن هستید؟"}
        confirmText="تأیید"
        cancelText="انصراف"
      />
    </div>
  );
}
