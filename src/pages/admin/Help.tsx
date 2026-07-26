// src/pages/admin/Help.tsx
import { AdminLayout } from "../../components/admin/AdminLayout";
import { LiquidGlassCard } from "../../components/ui/LiquidGlassCard";
import {
  BookOpen,
  Calendar,
  Users,
  Ticket,
  Settings,
  UserCog,
  LayoutDashboard,
  FileText,
  Building2,
  MessageSquare,
  HelpCircle,
  Shield,
  Zap,
  Sparkles,
  ChevronRight,
  Award,
  Brain,
  TrendingUp,
  Clock,
  Database,
  Bell,
} from "lucide-react";

export default function Help() {
  const sections = [
    {
      icon: <LayoutDashboard className="w-6 h-6" />,
      title: "📊 داشبورد",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      description: "نمای کلی از آمار و اطلاعات سیستم",
      items: [
        "مشاهده آمار کلی: تعداد پست‌ها، رویدادها، ثبت‌نام‌ها و بازدیدها",
        "دسترسی سریع به ایجاد پست جدید و رویداد جدید",
        "مشاهده آخرین فعالیت‌های سیستم",
        "نمایش گرافیکی وضعیت سیستم",
      ],
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "📝 مدیریت بلاگ",
      color: "text-green-400",
      bg: "bg-green-500/10",
      description: "ایجاد، ویرایش و مدیریت مطالب وبلاگ",
      items: [
        "ایجاد پست جدید با ویرایشگر پیشرفته (Markdown)",
        "مدیریت دسته‌بندی‌ها و برچسب‌ها",
        "تنظیم وضعیت انتشار (پیش‌نویس / منتشر شده)",
        "مشاهده آمار بازدید و لایک هر پست",
        "افزودن تصویر شاخص و کاور برای پست",
        "تولید محتوا با هوش مصنوعی",
        "مدیریت نظرات پست‌ها",
      ],
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "🎯 مدیریت رویدادها",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      description: "ایجاد و مدیریت رویدادها و ثبت‌نام‌ها",
      items: [
        "ایجاد رویداد با اطلاعات کامل (عکس، تاریخ، مکان، قیمت)",
        "مدیریت ظرفیت و وضعیت رویداد",
        "مشاهده لیست ثبت‌نام‌کنندگان و مدیریت وضعیت آنها",
        "ارسال لینک جلسه به شرکت‌کنندگان",
        "خروجی CSV از ثبت‌نام‌ها",
        "مدیریت رویدادهای ویژه و برجسته",
        "تنظیم یادآوری خودکار برای شرکت‌کنندگان",
      ],
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "👤 مدیریت کاربران",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      description: "مشاهده و مدیریت کاربران سیستم",
      items: [
        "مشاهده لیست کامل کاربران با جستجو و فیلتر",
        "مشاهده تاریخ عضویت و وضعیت کاربران",
        "غیرفعال/فعال کردن کاربران",
        "مشاهده دوره‌های ثبت‌نام شده هر کاربر",
        "مشاهده تاریخچه فعالیت کاربران",
        "ارسال ایمیل گروهی به کاربران",
      ],
    },
    {
      icon: <UserCog className="w-6 h-6" />,
      title: "👨‍💼 مدیریت کارمندان",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      description: "ایجاد و مدیریت کارمندان سیستم",
      items: [
        "ایجاد کارمند جدید با اطلاعات کامل",
        "تعیین نقش (کارمند، مدیر، ادمین)",
        "اختصاص رویدادها به کارمندان",
        "فعال/غیرفعال کردن کارمندان",
        "مشاهده عملکرد و آمار هر کارمند",
        "مدیریت دسترسی‌ها و نقش‌ها",
      ],
    },
    {
      icon: <Ticket className="w-6 h-6" />,
      title: "🎫 مدیریت تیکت‌ها",
      color: "text-red-400",
      bg: "bg-red-500/10",
      description: "مدیریت تیکت‌های پشتیبانی",
      items: [
        "مشاهده همه تیکت‌های کاربران",
        "پاسخ به تیکت‌ها و ارتباط با کاربران",
        "تغییر وضعیت تیکت (باز، در حال بررسی، حل شده، بسته)",
        "ایجاد تیکت گروهی برای چند کاربر",
        "مشاهده تاریخچه مکالمات هر تیکت",
        "اولویت‌بندی تیکت‌ها (کم، متوسط، بالا، فوری)",
      ],
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "💬 مدیریت پیام‌ها",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      description: "مدیریت پیام‌های تماس کاربران",
      items: [
        "مشاهده همه پیام‌های دریافتی از فرم تماس",
        "علامت‌گذاری پیام‌ها به عنوان خوانده شده",
        "پاسخ به پیام‌ها از طریق ایمیل",
        "حذف پیام‌های نامطلوب",
        "مشاهده اطلاعات تماس کاربران",
      ],
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "🏢 مدیریت همکاران",
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      description: "مدیریت همکاران و شرکا",
      items: [
        "افزودن همکار جدید با لوگو و لینک وبسایت",
        "ترتیب نمایش همکاران در صفحه اصلی",
        "فعال/غیرفعال کردن همکاران",
        "مدیریت توضیحات و اطلاعات همکاران",
      ],
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "⚙️ تنظیمات سایت",
      color: "text-gray-400",
      bg: "bg-white/5",
      description: "تنظیمات عمومی و ظاهری سایت",
      items: [
        "تنظیم اطلاعات تماس (ایمیل، تلفن، آدرس)",
        "تنظیم شبکه‌های اجتماعی",
        "تنظیمات SEO برای بهبود رتبه در موتورهای جستجو",
        "فعال‌سازی حالت نگهداری (Maintenance Mode)",
        "تنظیم نام و توضیحات سایت",
        "مدیریت ساعت کاری",
        "تنظیمات ظاهری و رنگ‌بندی",
      ],
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "🔐 امنیت و دسترسی‌ها",
      color: "text-red-400",
      bg: "bg-red-500/10",
      description: "مدیریت امنیت و دسترسی‌ها",
      items: [
        "مدیریت نقش‌های کاربری (ادمین، مدیر، کارمند)",
        "تنظیم سطح دسترسی هر نقش",
        "مشاهده لاگ فعالیت‌های کاربران",
        "تغییر رمز عبور",
        "تنظیمات امنیتی پیشرفته",
      ],
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "💾 مدیریت محتوا",
      color: "text-green-400",
      bg: "bg-green-500/10",
      description: "مدیریت فایل‌ها و محتوای رسانه‌ای",
      items: [
        "آپلود و مدیریت تصاویر",
        "مدیریت فایل‌های ضمیمه",
        "بهینه‌سازی تصاویر",
        "مدیریت گالری‌ها",
      ],
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "👥 مدیریت تیم",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      description: "مدیریت اعضای تیم و کارکنان",
      items: [
        "مشاهده لیست اعضای تیم",
        "افزودن عضو جدید",
        "مدیریت اطلاعات اعضا",
        "تنظیم نقش و دسترسی",
      ],
    },
  ];

  const quickTips = [
    {
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      title: "استفاده از جستجو",
      description:
        "از نوار جستجو در بالای صفحه برای پیدا کردن سریع محتوا استفاده کنید",
    },
    {
      icon: <Shield className="w-5 h-5 text-green-400" />,
      title: "امنیت",
      description:
        "همیشه پس از اتمام کار از پنل خارج شوید. رمز عبور خود را به‌روز نگه دارید.",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      title: "به‌روزرسانی مداوم",
      description:
        "محتوای سایت را به‌روز نگه دارید تا کاربران همیشه مطالب جدید ببینند.",
    },
    {
      icon: <Clock className="w-5 h-5 text-blue-400" />,
      title: "مدیریت زمان",
      description: "برای رویدادها و پست‌ها زمان‌بندی مناسب تنظیم کنید.",
    },
    {
      icon: <Bell className="w-5 h-5 text-orange-400" />,
      title: "اعلان‌ها",
      description: "اعلان‌های مهم را فعال کنید تا از رویدادهای جدید مطلع شوید.",
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <LiquidGlassCard
              blurIntensity="md"
              borderRadius="100px"
              glowIntensity="sm"
              className="inline-flex px-4 py-2"
            >
              <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                راهنمای کامل پنل مدیریت
              </span>
            </LiquidGlassCard>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              آموزش کامل مدیریت سایت
            </span>
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            راهنمای جامع و کامل استفاده از تمامی بخش‌های پنل مدیریت سایت Supreme
            Tech
          </p>
        </div>

        {/* Quick Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {quickTips.map((tip, index) => (
            <LiquidGlassCard
              key={index}
              className="p-4 text-center"
              borderRadius="16px"
              blurIntensity="sm"
              glowIntensity="sm"
            >
              <div className="flex justify-center mb-2">{tip.icon}</div>
              <h4 className="text-white font-bold text-sm">{tip.title}</h4>
              <p className="text-gray-400 text-xs mt-1">{tip.description}</p>
            </LiquidGlassCard>
          ))}
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <LiquidGlassCard
              key={index}
              className="p-6 hover:scale-[1.01] transition-all duration-300"
              borderRadius="16px"
              blurIntensity="lg"
              glowIntensity="md"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl ${section.bg} ${section.color} flex-shrink-0`}
                >
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-bold ${section.color}`}>
                    {section.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {section.description}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {section.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-300"
                      >
                        <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </LiquidGlassCard>
          ))}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <LiquidGlassCard
            className="p-6 text-center"
            borderRadius="16px"
            blurIntensity="lg"
            glowIntensity="sm"
          >
            <Award className="w-10 h-10 text-blue-400 mx-auto mb-3" />
            <h4 className="text-white font-bold">نکات حرفه‌ای</h4>
            <p className="text-gray-400 text-sm mt-2">
              استفاده از برچسب‌ها و دسته‌بندی‌ها برای بهبود سئو و دسترسی کاربران
            </p>
          </LiquidGlassCard>
          <LiquidGlassCard
            className="p-6 text-center"
            borderRadius="16px"
            blurIntensity="lg"
            glowIntensity="sm"
          >
            <Brain className="w-10 h-10 text-purple-400 mx-auto mb-3" />
            <h4 className="text-white font-bold">هوش مصنوعی</h4>
            <p className="text-gray-400 text-sm mt-2">
              از قابلیت‌های هوش مصنوعی برای تولید محتوا و تحلیل داده‌ها استفاده
              کنید
            </p>
          </LiquidGlassCard>
          <LiquidGlassCard
            className="p-6 text-center"
            borderRadius="16px"
            blurIntensity="lg"
            glowIntensity="sm"
          >
            <TrendingUp className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <h4 className="text-white font-bold">تحلیل و بهینه‌سازی</h4>
            <p className="text-gray-400 text-sm mt-2">
              با تحلیل آمار و بازدیدها، محتوای خود را بهینه‌سازی کنید
            </p>
          </LiquidGlassCard>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <LiquidGlassCard
            className="p-6"
            borderRadius="16px"
            blurIntensity="lg"
            glowIntensity="sm"
          >
            <p className="text-gray-400 text-sm">
              <BookOpen className="w-4 h-4 inline-block ml-1 text-blue-400" />
              برای اطلاعات بیشتر و راهنمایی‌های تکمیلی، با تیم پشتیبانی تماس
              بگیرید
            </p>
            <p className="text-gray-500 text-xs mt-2">
              آخرین بروزرسانی: مرداد ۱۴۰۵ | نسخه ۲.۰
            </p>
            <p className="text-gray-500 text-xs mt-1">
              تمامی حقوق برای Supreme Tech محفوظ است
            </p>
          </LiquidGlassCard>
        </div>
      </div>
    </AdminLayout>
  );
}
