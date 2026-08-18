// src/pages/Profile/Profile.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../../lib/api/users";
import {
  enrollmentsAPI,
  type Enrollment as APIEnrollment,
} from "../../lib/api/enrollments";
import { coursesAPI } from "../../lib/api/courses";
import { ticketsAPI, type Ticket } from "../../lib/api/tickets";
import { messagesAPI } from "../../lib/api/messages";
import { uploadAPI } from "../../lib/api/upload";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
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
} from "lucide-react";
import { authAPI } from "../../lib/api";

// ============== Interfaces ==============
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

type Enrollment = APIEnrollment & {
  eventId: string;
  event: {
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
};

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
// 🔥 کامپوننت پاسخ‌های پیام‌ها
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

// ============== Main Component ==============
export default function Profile() {
  // const navigate = useNavigate();

  // ============== States ==============
  const [user, setUser] = useState<UserProfile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [cart, setCart] = useState<Enrollment[]>([]);
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
  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleCartClick = () => {
    navigate("/cart");
  };
  // ============== توابع ==============
  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("⚠️ توکن وجود ندارد");
        setTickets([]);
        return;
      }

      const data = await ticketsAPI.getMyTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("❌ خطا در دریافت تیکت‌ها:", err);
      setError("خطا در دریافت تیکت‌ها");
    } finally {
      setTicketsLoading(false);
    }
  };

  const fetchReplies = async () => {
    if (!user?.id) return;
    setRepliesLoading(true);
    try {
      const data = await messagesAPI.getUserReplies(user.id);
      setReplies(data || []);
    } catch (err) {
      console.error("❌ خطا در دریافت پاسخ‌ها:", err);
    } finally {
      setRepliesLoading(false);
    }
  };

  const fetchCourseDetails = async (courseId: string) => {
    try {
      const course = await coursesAPI.getById(courseId);
      return {
        id: course.id,
        title: course.title || "دوره آموزشی",
        slug: course.slug || "",
        date: course.created_at || new Date().toISOString(),
        price: course.price || 0,
        image: course.cover_image || "",
        duration: course.duration_hours ? `${course.duration_hours} ساعت` : "",
        meetingLink: "",
      };
    } catch (error) {
      console.error(`❌ خطا در دریافت دوره ${courseId}:`, error);
      return {
        id: courseId,
        title: "دوره آموزشی",
        slug: "",
        date: new Date().toISOString(),
        price: 0,
        image: "",
        duration: "",
        meetingLink: "",
      };
    }
  };

  // ============== useEffect ==============
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token) {
          console.warn("⚠️ توکن وجود ندارد، هدایت به لاگین");
          navigate("/login");
          return;
        }

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setFormData({
            name: parsedUser.name || "",
            email: parsedUser.email || "",
            phone: parsedUser.phone || "",
            province: parsedUser.province || "",
            birthDate: parsedUser.birthDate || "",
            gender: parsedUser.gender || "",
            avatar: parsedUser.avatar || "",
          });
          if (parsedUser.avatar) {
            setAvatarPreview(parsedUser.avatar);
          }
        } else {
          try {
            const profileData = await usersAPI.getMyProfile();
            if (profileData) {
              setUser(profileData);
              localStorage.setItem("user", JSON.stringify(profileData));
              setFormData({
                name: profileData.name || "",
                email: profileData.email || "",
                phone: profileData.phone || "",
                province: profileData.province || "",
                birthDate: profileData.birthDate || "",
                gender: profileData.gender || "",
                avatar: profileData.avatar || "",
              });
              if (profileData.avatar) {
                setAvatarPreview(profileData.avatar);
              }
            }
          } catch (err: any) {
            console.error("❌ خطا در دریافت پروفایل:", err);
            if (err?.status === 401) {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
              return;
            }
          }
        }

        // ✅ دریافت ثبت‌نام‌ها از هر دو منبع
        try {
          // 1. از localStorage
          const localEnrollments = JSON.parse(
            localStorage.getItem("enrollments") || "[]",
          );
          console.log("📥 localStorage enrollments:", localEnrollments);

          // 2. از API
          const apiEnrollments = await enrollmentsAPI.getMyEnrollments();
          console.log("📥 API enrollments:", apiEnrollments);

          // 3. ترکیب و حذف تکراری‌ها
          const combined = [...apiEnrollments, ...localEnrollments];
          const unique = combined.filter(
            (item, index, self) =>
              self.findIndex(
                (i) => i.id === item.id || i.course_id === item.course_id,
              ) === index,
          );

          console.log("📋 همه ثبت‌نام‌ها:", unique);

          // ✅ 4. دریافت اطلاعات دوره برای هر ثبت‌نام
          const mappedEnrollments: Enrollment[] = await Promise.all(
            unique.map(async (e: any) => {
              // پیدا کردن course_id
              const courseId = e.course_id || e.event_id || e.id;

              // دریافت اطلاعات دوره
              let courseData;
              if (e.event && e.event.title && e.event.title !== "بدون عنوان") {
                courseData = e.event;
              } else if (e.course && e.course.title) {
                courseData = e.course;
              } else {
                courseData = await fetchCourseDetails(courseId);
              }

              // استفاده از id موجود یا تولید id
              const id =
                e.id ||
                e.enrollment_id ||
                `enr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

              return {
                ...e,
                id: id,
                eventId: e.event_id || e.eventId || courseId,
                paymentStatus: e.payment_status || e.paymentStatus || "PENDING",
                createdAt:
                  e.created_at || e.createdAt || new Date().toISOString(),
                status: e.status || "PENDING",
                event: {
                  id: courseData.id || courseId,
                  title: String(courseData.title || "دوره آموزشی"),
                  slug: courseData.slug || "",
                  date: courseData.date || new Date().toISOString(),
                  price: Number(courseData.price || 0),
                  image: courseData.image || "",
                  duration: courseData.duration || "",
                  meetingLink: courseData.meetingLink || "",
                },
              };
            }),
          );

          console.log("📋 ثبت‌نام‌های تبدیل شده:", mappedEnrollments);
          setEnrollments(mappedEnrollments);

          // 5. فیلتر برای سبد خرید
          const pending = mappedEnrollments.filter(
            (e: any) =>
              e.paymentStatus === "PENDING" ||
              e.paymentStatus === "WAITING_VERIFY",
          );

          console.log("🛒 آیتم‌های سبد خرید:", pending);
          setCart(pending);
        } catch (err) {
          console.error("❌ خطا در دریافت ثبت‌نام‌ها:", err);
        }

        await fetchTickets();
      } catch (err: any) {
        console.error("❌ خطا در fetchProfile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (user?.id) {
      fetchReplies();
    }
  }, [user?.id]);

  // ============== Profile Functions ==============
  const handleEdit = () => {
    setEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
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
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadAvatar(file);
      const updatedUser = await usersAPI.updateMyProfile({ avatar: imageUrl });
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setAvatarPreview(imageUrl);
      setSuccess("آواتار با موفقیت بروزرسانی شد");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("❌ خطا در آپلود آواتار:", error);
      setError("خطا در آپلود تصویر");
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(user?.avatar || "");
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      const response = await uploadAPI.uploadImage(file, "avatars");
      return response.url;
    } catch (error) {
      console.error("❌ خطا در آپلود آواتار:", error);
      throw new Error("خطا در آپلود تصویر");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let avatarUrl = formData.avatar;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      const updateData: any = {};

      if (formData.name !== user?.name && formData.name?.trim()) {
        updateData.name = formData.name.trim();
      }
      if (formData.email !== user?.email && formData.email?.trim()) {
        updateData.email = formData.email.trim();
      }
      if (formData.phone !== user?.phone && formData.phone?.trim()) {
        updateData.phone = formData.phone.trim();
      }
      if (formData.province !== user?.province && formData.province?.trim()) {
        updateData.province = formData.province.trim();
      }
      if (formData.birthDate && formData.birthDate.trim()) {
        updateData.birthDate = formData.birthDate.trim();
      }
      if (formData.gender && formData.gender.trim()) {
        updateData.gender = formData.gender.trim();
      }
      if (avatarUrl !== user?.avatar && avatarUrl) {
        updateData.avatar = avatarUrl;
      }

      if (Object.keys(updateData).length === 0) {
        setSuccess("هیچ تغییری اعمال نشد");
        setEditing(false);
        setSaving(false);
        return;
      }

      const updatedUser = await authAPI.updateProfile(updateData);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
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
  };

  const handleLogout = () => {
    if (confirm("آیا از خروج از حساب کاربری مطمئن هستید؟")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // ============== Payment Functions ==============
  const handlePayment = (enrollmentId: string) => {
    console.log("🔍 enrollmentId:", enrollmentId);
    if (
      !enrollmentId ||
      enrollmentId === "undefined" ||
      enrollmentId === "null"
    ) {
      alert("خطا: شناسه ثبت‌نام نامعتبر است");
      return;
    }
    navigate(`/cart?payment=${enrollmentId}`);
  };

  const processPayment = async () => {
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
        const updated = await enrollmentsAPI.getMyEnrollments();
        const mappedEnrollments: Enrollment[] = (updated || []).map(
          (e: any) => ({
            ...e,
            eventId: e.event_id || e.eventId || e.course_id || "",
            paymentStatus: e.payment_status || e.paymentStatus || "PENDING",
            createdAt: e.created_at || e.createdAt || new Date().toISOString(),
            status: e.status || "PENDING",
            event: {
              id: e.event_id || e.course_id || "",
              title: String(e.event?.title || e.title || "بدون عنوان"),
              slug: e.event?.slug || e.slug || "",
              date: e.event?.date || e.date || new Date().toISOString(),
              price: Number(e.event?.price || e.price || 0),
              image: e.event?.image || e.image,
              duration: e.event?.duration || e.duration,
              meetingLink: e.event?.meetingLink || e.meetingLink,
            },
          }),
        );
        setEnrollments(mappedEnrollments);
        setCart(
          mappedEnrollments.filter((e: any) => e.paymentStatus === "PENDING"),
        );
        setShowPayment(false);
        setSelectedEnrollment(null);
      }
      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "خطا در پردازش پرداخت");
    } finally {
      setSaving(false);
    }
  };

  // ============== Cart Functions ==============
  const handleCartPayment = async (enrollmentId: string) => {
    setProcessingId(enrollmentId);
    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const result = await enrollmentsAPI.processPayment(enrollmentId);
      if (result.paymentUrl) {
        window.open(result.paymentUrl, "_blank");
        setSuccess("✅ لینک پرداخت باز شد");
      } else {
        setSuccess("✅ پرداخت با موفقیت انجام شد!");
        const updated = await enrollmentsAPI.getMyEnrollments();
        const mappedEnrollments: Enrollment[] = (updated || []).map(
          (e: any) => ({
            ...e,
            eventId: e.event_id || e.eventId || e.course_id || "",
            paymentStatus: e.payment_status || e.paymentStatus || "PENDING",
            createdAt: e.created_at || e.createdAt || new Date().toISOString(),
            status: e.status || "PENDING",
            event: {
              id: e.event_id || e.course_id || "",
              title: String(e.event?.title || e.title || "بدون عنوان"),
              slug: e.event?.slug || e.slug || "",
              date: e.event?.date || e.date || new Date().toISOString(),
              price: Number(e.event?.price || e.price || 0),
              image: e.event?.image || e.image,
              duration: e.event?.duration || e.duration,
              meetingLink: e.event?.meetingLink || e.meetingLink,
            },
          }),
        );
        setEnrollments(mappedEnrollments);
        setCart(
          mappedEnrollments.filter((e: any) => e.paymentStatus === "PENDING"),
        );
      }
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("خطا در پردازش پرداخت");
    } finally {
      setProcessing(false);
      setProcessingId(null);
    }
  };

  const handleRemoveFromCart = async (enrollmentId: string) => {
    if (!confirm("آیا از حذف این آیتم از سبد خرید مطمئن هستید؟")) return;

    try {
      setCart(cart.filter((item) => item.id !== enrollmentId));
      setSuccess("✅ آیتم از سبد خرید حذف شد");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("خطا در حذف آیتم");
    }
  };

  const handlePayAll = async () => {
    if (cart.length === 0) return;

    const totalPrice = cart.reduce(
      (sum, item) => sum + (item.event?.price || 0),
      0,
    );
    if (
      !confirm(
        `آیا از پرداخت مبلغ ${totalPrice.toLocaleString()} تومان برای ${cart.length} دوره مطمئن هستید؟`,
      )
    ) {
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      for (const item of cart) {
        const result = await enrollmentsAPI.processPayment(item.id);
        if (!result.paymentUrl) {
          setError(`خطا در پرداخت دوره "${item.event?.title}"`);
          setProcessing(false);
          return;
        }
      }

      setSuccess(`✅ پرداخت ${cart.length} دوره با موفقیت انجام شد!`);
      const updated = await enrollmentsAPI.getMyEnrollments();
      const mappedEnrollments: Enrollment[] = (updated || []).map((e: any) => ({
        ...e,
        eventId: e.event_id || e.eventId || e.course_id || "",
        paymentStatus: e.payment_status || e.paymentStatus || "PENDING",
        createdAt: e.created_at || e.createdAt || new Date().toISOString(),
        status: e.status || "PENDING",
        event: {
          id: e.event_id || e.course_id || "",
          title: String(e.event?.title || e.title || "بدون عنوان"),
          slug: e.event?.slug || e.slug || "",
          date: e.event?.date || e.date || new Date().toISOString(),
          price: Number(e.event?.price || e.price || 0),
          image: e.event?.image || e.image,
          duration: e.event?.duration || e.duration,
          meetingLink: e.event?.meetingLink || e.meetingLink,
        },
      }));
      setEnrollments(mappedEnrollments);
      setCart(
        mappedEnrollments.filter((e: any) => e.paymentStatus === "PENDING"),
      );
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("خطا در پردازش پرداخت‌ها");
    } finally {
      setProcessing(false);
    }
  };

  // ============== Ticket Functions ==============
  const handleCreateTicket = () => {
    navigate("/tickets/create");
  };

  const handleViewTicket = (id: string) => {
    navigate(`/tickets/${id}`);
  };

  const handleDeleteTicket = async (id: string) => {
    try {
      await ticketsAPI.delete(id);
      setTickets(tickets.filter((t) => t.id !== id));
      setSuccess("✅ تیکت با موفقیت حذف شد");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("خطا در حذف تیکت");
    }
  };

  const handleSendTicketMessage = async (ticketId: string, message: string) => {
    try {
      await ticketsAPI.addMessage(ticketId, message);
      await fetchTickets();
    } catch (err) {
      console.error("❌ خطا در ارسال پیام:", err);
      throw err;
    }
  };

  // ============== Helper Functions ==============
  const getStatusLabel = (status: string) => {
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
  };

  const getPaymentStatusLabel = (status?: string) => {
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
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "نامشخص";
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "رایگان";
    return `${price.toLocaleString()} تومان`;
  };

  // ============== Stats ==============
  const stats = {
    totalEnrollments: enrollments.length,
    confirmedEnrollments: enrollments.filter((e) => e.status === "CONFIRMED")
      .length,
    pendingEnrollments: enrollments.filter((e) => e.status === "PENDING")
      .length,
    attendedEnrollments: enrollments.filter((e) => e.status === "CANCELLED")
      .length,
    cartCount: cart.length,
    ticketCount: tickets.length,
    repliesCount: replies.length,
  };

  // ============== Loading & Error States ==============
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
        {/* عکس پروفایل */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user.name || "کاربر"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-avatar.jpg";
                  }}
                />
              ) : (
                <span className="text-4xl text-white font-bold">
                  {user?.name?.charAt(0) || user?.phone?.charAt(0) || "U"}
                </span>
              )}
            </div>
            {editing && (
              <>
                <label className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
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
                    className="absolute bottom-0 left-0 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
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

        <ProfileHeader
          user={user}
          cartCount={stats.cartCount}
          onLogout={handleLogout}
          onCartClick={handleCartClick}
        />

        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          cartCount={stats.cartCount}
          ticketCount={stats.ticketCount}
        />

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
              onLogout={handleLogout}
            />
          </div>

          <div className="lg:col-span-2">
            {activeTab === "enrollments" && (
              <EnrollmentsTab
                enrollments={enrollments.map((e) => ({
                  ...e,
                  eventId: e.eventId || e.course_id || "",
                  createdAt:
                    e.createdAt || e.created_at || new Date().toISOString(),
                  status: e.status || "PENDING",
                  event: {
                    id: e.eventId || e.course_id || "",
                    title: String(e.event?.title || "بدون عنوان"),
                    slug: e.event?.slug || "",
                    date: e.event?.date || new Date().toISOString(),
                    price: Number(e.event?.price || 0),
                    image: e.event?.image,
                    duration: e.event?.duration,
                    meetingLink: e.event?.meetingLink,
                  },
                }))}
                navigate={navigate}
                formatDate={formatDate}
                formatPrice={formatPrice}
                getStatusLabel={getStatusLabel}
                getPaymentStatusLabel={getPaymentStatusLabel}
                handlePayment={handlePayment}
              />
            )}

            {activeTab === "cart" && (
              <CartTab
                cart={cart}
                processing={processing}
                processingId={processingId}
                totalCartPrice={cart.reduce(
                  (sum, item) => sum + (item.event?.price || 0),
                  0,
                )}
                isCartFree={
                  cart.reduce(
                    (sum, item) => sum + (item.event?.price || 0),
                    0,
                  ) === 0 && cart.length > 0
                }
                handleCartPayment={handleCartPayment}
                handleRemoveFromCart={handleRemoveFromCart}
                handlePayAll={handlePayAll}
                formatPrice={formatPrice}
                navigate={navigate}
              />
            )}

            {activeTab === "tickets" && (
              <TicketsTab
                tickets={tickets}
                loading={ticketsLoading}
                navigate={navigate}
                onCreateTicket={handleCreateTicket}
                onViewTicket={handleViewTicket}
                onDeleteTicket={handleDeleteTicket}
                onSendMessage={handleSendTicketMessage}
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
    </div>
  );
}
