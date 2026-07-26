// src/components/sections/Contact.tsx
import { useState, useEffect } from "react";
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import { Mail, Phone, MapPin, Send, Copy } from "lucide-react";
import { settingsAPI } from "../../lib/api/settings";
import { messagesAPI } from "../../lib/api/messages"; // 🔥 اضافه کن

interface Settings {
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactMapLink?: string;
  socialLinks?: {
    telegram?: string;
  };
}

export default function Contact() {
  const [settings, setSettings] = useState<Settings>({
    contactEmail: "info@supremetech.ir",
    contactPhone: "09121234567",
    contactAddress:
      "تهران، بزرگراه اشرفی اصفهانی، بالاتر از میدان پونک، مجتمع نیایش",
    contactMapLink: "https://maps.app.goo.gl/3JnB1ePWY57CiHkf6",
    socialLinks: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // 🔥 اضافه کن
  const [success, setSuccess] = useState(""); // 🔥 اضافه کن
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsAPI.getAll();
        if (data) {
          setSettings(data);
        }
      } catch (error) {
        console.error("خطا در دریافت تنظیمات:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${type} با موفقیت کپی شد!`);
    } catch (err) {
      alert("خطا در کپی کردن");
    }
  };

  // 🔥 اصلاح شده
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await messagesAPI.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.projectType || "درخواست همکاری",
        message: formData.description,
      });

      setSuccess("✅ پیام شما با موفقیت ارسال شد!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        projectType: "",
        description: "",
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(err.response?.data?.error || "خطا در ارسال پیام");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-24 px-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <LiquidGlassCard
              blurIntensity="md"
              borderRadius="100px"
              glowIntensity="sm"
              className="inline-flex px-4 py-2 mb-6"
            >
              <div className="inline-flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">
                  تماس با ما
                </span>
              </div>
            </LiquidGlassCard>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-l from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              آماده شروع همکاری هستید؟
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            آماده‌اید تا کسب‌وکارتان را با قدرت AI Agent ها متحول کنید؟ همین
            امروز با تیم Supreme Tech در ارتباط باشید و مشاوره رایگان دریافت
            کنید.
          </p>
        </div>

        {/* 🔥 پیام‌های موفقیت و خطا */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-4 text-center">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* فرم تماس */}
          <LiquidGlassCard
            blurIntensity="lg"
            borderRadius="32px"
            glowIntensity="md"
            className="p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-16 text-center">
              فرم تماس سریع
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="نام و نام خانوادگی"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="ایمیل"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    type="tel"
                    placeholder="شماره تماس"
                    dir="rtl"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <input
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    type="text"
                    placeholder="نوع پروژه"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="توضیحات پروژه"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
              <GlassButton
                type="submit"
                fullWidth
                variant="primary"
                size="lg"
                loading={isSubmitting}
                icon={<Send className="w-4 h-4" />}
                iconPosition="left"
              >
                {isSubmitting ? "در حال ارسال..." : "ارسال درخواست"}
              </GlassButton>
            </form>
          </LiquidGlassCard>

          {/* اطلاعات تماس */}
          <div className="space-y-6">
            <LiquidGlassCard
              blurIntensity="lg"
              borderRadius="24px"
              glowIntensity="sm"
              className="p-4 group cursor-pointer hover:scale-105 transition-all duration-300"
              onClick={() =>
                copyToClipboard(
                  settings?.contactEmail || "info@supremetech.ir",
                  "ایمیل",
                )
              }
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">ایمیل</h4>
                  <p className="text-gray-400 text-xs">
                    {loading
                      ? "..."
                      : settings?.contactEmail || "info@supremetech.ir"}
                  </p>
                </div>
                <Copy className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition" />
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard
              blurIntensity="lg"
              borderRadius="24px"
              glowIntensity="sm"
              className="p-4 group cursor-pointer hover:scale-105 transition-all duration-300"
              onClick={() =>
                copyToClipboard(
                  settings?.contactPhone || "09121234567",
                  "شماره تلفن",
                )
              }
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                  <Phone className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">تلفن</h4>
                  <p className="text-gray-400 text-xs">
                    {loading ? "..." : settings?.contactPhone || "09121234567"}
                  </p>
                </div>
                <Copy className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition" />
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard
              blurIntensity="lg"
              borderRadius="24px"
              glowIntensity="sm"
              className="p-4 group cursor-pointer hover:scale-105 transition-all duration-300"
              onClick={() =>
                window.open(
                  settings?.socialLinks?.telegram ||
                    "https://t.me/+1v7oDTt7vro3MWVk",
                  "_blank",
                )
              }
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                  <Send className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">
                    کانال تلگرام
                  </h4>
                  <p className="text-gray-400 text-xs">
                    {loading
                      ? "..."
                      : settings?.socialLinks?.telegram || "@SupremeTech_co"}
                  </p>
                </div>
                <Copy className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition" />
              </div>
            </LiquidGlassCard>

            <a
              href={
                settings?.contactMapLink ||
                "https://maps.app.goo.gl/3JnB1ePWY57CiHkf6"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <LiquidGlassCard
                blurIntensity="lg"
                borderRadius="24px"
                glowIntensity="sm"
                className="p-4 group hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                    <MapPin className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm">آدرس</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      {loading
                        ? "..."
                        : settings?.contactAddress ||
                          "تهران، بزرگراه اشرفی اصفهانی، بالاتر از میدان پونک، مجتمع نیایش"}
                    </p>
                  </div>
                </div>
              </LiquidGlassCard>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// // src/components/sections/Contact.tsx
// import { useState, useEffect } from "react";
// import { LiquidGlassCard } from "../ui/LiquidGlassCard";
// import { GlassButton } from "../ui/GlassButton";
// import { Mail, Phone, MapPin, Send, Copy } from "lucide-react";
// import { settingsAPI } from "../../lib/api/settings";
// import { messagesAPI } from "../../lib/api/messages";

// interface Settings {
//   contactEmail: string;
//   contactPhone: string;
//   contactAddress: string;
//   contactMapLink?: string;
//   socialLinks?: {
//     telegram?: string;
//   };
// }

// export default function Contact() {
//   const [settings, setSettings] = useState<Settings>({
//     contactEmail: "info@supremetech.ir",
//     contactPhone: "09121234567",
//     contactAddress:
//       "تهران، بزرگراه اشرفی اصفهانی، بالاتر از میدان پونک، مجتمع نیایش",
//     contactMapLink: "https://maps.app.goo.gl/3JnB1ePWY57CiHkf6",
//     socialLinks: {},
//   });
//   const [loading, setLoading] = useState(true);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     projectType: "",
//     description: "",
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     const fetchSettings = async () => {
//       try {
//         const data = await settingsAPI.getAll();
//         if (data) {
//           setSettings(data);
//         }
//       } catch (error) {
//         console.error("خطا در دریافت تنظیمات:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSettings();
//   }, []);

//   const copyToClipboard = async (text: string, type: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       alert(`${type} با موفقیت کپی شد!`);
//     } catch (err) {
//       alert("خطا در کپی کردن");
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setTimeout(() => {
//       alert("درخواست شما با موفقیت ارسال شد!");
//       setIsSubmitting(false);
//       setFormData({
//         name: "",
//         email: "",
//         phone: "",
//         projectType: "",
//         description: "",
//       });
//     }, 1000);
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
//   ) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   return (
//     <section id="contact" className="py-24 px-6">
//       <div className="container mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="flex justify-center">
//             <LiquidGlassCard
//               blurIntensity="md"
//               borderRadius="100px"
//               glowIntensity="sm"
//               className="inline-flex px-4 py-2 mb-6"
//             >
//               <div className="inline-flex items-center gap-2">
//                 <Phone className="w-4 h-4 text-blue-400" />
//                 <span className="text-sm font-medium text-gray-300">
//                   تماس با ما
//                 </span>
//               </div>
//             </LiquidGlassCard>
//           </div>
//           <h2 className="text-3xl md:text-5xl font-bold mb-6">
//             <span className="bg-gradient-to-l from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
//               آماده شروع همکاری هستید؟
//             </span>
//           </h2>

//           <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
//             آماده‌اید تا کسب‌وکارتان را با قدرت AI Agent ها متحول کنید؟ همین
//             امروز با تیم Supreme Tech در ارتباط باشید و مشاوره رایگان دریافت
//             کنید.
//           </p>
//         </div>

//         <div className="grid lg:grid-cols-2 gap-8">
//           {/* فرم تماس */}
//           <LiquidGlassCard
//             blurIntensity="lg"
//             borderRadius="32px"
//             glowIntensity="md"
//             className="p-8"
//           >
//             <h3 className="text-2xl font-bold text-white mb-16 text-center">
//               فرم تماس سریع
//             </h3>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="grid md:grid-cols-2 gap-4">
//                 <div>
//                   <input
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     type="text"
//                     placeholder="نام و نام خانوادگی"
//                     required
//                     className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
//                   />
//                 </div>
//                 <div>
//                   <input
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     type="email"
//                     placeholder="ایمیل"
//                     required
//                     className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
//                   />
//                 </div>
//               </div>
//               <div className="grid md:grid-cols-2 gap-4">
//                 <div>
//                   <input
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     type="tel"
//                     placeholder="شماره تماس"
//                     dir="rtl"
//                     required
//                     className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
//                   />
//                 </div>
//                 <div>
//                   <input
//                     name="projectType"
//                     value={formData.projectType}
//                     onChange={handleChange}
//                     type="text"
//                     placeholder="نوع پروژه"
//                     required
//                     className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   rows={4}
//                   placeholder="توضیحات پروژه"
//                   required
//                   className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
//                 />
//               </div>
//               <GlassButton
//                 type="submit"
//                 fullWidth
//                 variant="primary"
//                 size="lg"
//                 loading={isSubmitting}
//                 icon={<Send className="w-4 h-4" />}
//                 iconPosition="left"
//               >
//                 {isSubmitting ? "در حال ارسال..." : "ارسال درخواست"}
//               </GlassButton>
//             </form>
//           </LiquidGlassCard>

//           {/* اطلاعات تماس */}
//           <div className="space-y-6">
//             {/* <LiquidGlassCard
//               blurIntensity="lg"
//               borderRadius="32px"
//               glowIntensity="md"
//               className="p-6 text-center"
//             >
//               <h3 className="text-xl font-bold text-white mb-3">
//                 شروع سریع پروژه
//               </h3>
//               <p className="text-gray-400 mb-4 text-sm">
//                 نیاز به مشاوره فوری دارید؟ با یک کلیک، جلسه مشاوره رایگان خود را
//                 شروع کنید.
//               </p>
//               <GlassButton
//                 className="mx-auto"
//                 variant="primary"
//                 size="md"
//                 onClick={() =>
//                   window.open("https://mentor.supremetech.ir", "_blank")
//                 }
//               >
//                 شروع مشاوره رایگان
//               </GlassButton>
//             </LiquidGlassCard> */}

//             <LiquidGlassCard
//               blurIntensity="lg"
//               borderRadius="24px"
//               glowIntensity="sm"
//               className="p-4 group cursor-pointer hover:scale-105 transition-all duration-300"
//               onClick={() =>
//                 copyToClipboard(
//                   settings?.contactEmail || "info@supremetech.ir",
//                   "ایمیل",
//                 )
//               }
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
//                   <Mail className="w-6 h-6 text-blue-400" />
//                 </div>
//                 <div className="flex-1">
//                   <h4 className="font-semibold text-white text-sm">ایمیل</h4>
//                   <p className="text-gray-400 text-xs">
//                     {loading
//                       ? "..."
//                       : settings?.contactEmail || "info@supremetech.ir"}
//                   </p>
//                 </div>
//                 <Copy className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition" />
//               </div>
//             </LiquidGlassCard>

//             <LiquidGlassCard
//               blurIntensity="lg"
//               borderRadius="24px"
//               glowIntensity="sm"
//               className="p-4 group cursor-pointer hover:scale-105 transition-all duration-300"
//               onClick={() =>
//                 copyToClipboard(
//                   settings?.contactPhone || "09121234567",
//                   "شماره تلفن",
//                 )
//               }
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
//                   <Phone className="w-6 h-6 text-cyan-400" />
//                 </div>
//                 <div className="flex-1">
//                   <h4 className="font-semibold text-white text-sm">تلفن</h4>
//                   <p className="text-gray-400 text-xs">
//                     {loading ? "..." : settings?.contactPhone || "09121234567"}
//                   </p>
//                 </div>
//                 <Copy className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition" />
//               </div>
//             </LiquidGlassCard>

//             <LiquidGlassCard
//               blurIntensity="lg"
//               borderRadius="24px"
//               glowIntensity="sm"
//               className="p-4 group cursor-pointer hover:scale-105 transition-all duration-300"
//               onClick={() =>
//                 window.open(
//                   settings?.socialLinks?.telegram ||
//                     "https://t.me/+1v7oDTt7vro3MWVk",
//                   "_blank",
//                 )
//               }
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
//                   <Send className="w-6 h-6 text-purple-400" />
//                 </div>
//                 <div className="flex-1">
//                   <h4 className="font-semibold text-white text-sm">
//                     کانال تلگرام
//                   </h4>
//                   <p className="text-gray-400 text-xs">
//                     {loading
//                       ? "..."
//                       : settings?.socialLinks?.telegram || "@SupremeTech_co"}
//                   </p>
//                 </div>
//                 <Copy className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition" />
//               </div>
//             </LiquidGlassCard>

//             {/* 🔥 آدرس با لینک مستقیم */}
//             <a
//               href={
//                 settings?.contactMapLink ||
//                 "https://maps.app.goo.gl/3JnB1ePWY57CiHkf6"
//               }
//               target="_blank"
//               rel="noopener noreferrer"
//               className="block"
//             >
//               <LiquidGlassCard
//                 blurIntensity="lg"
//                 borderRadius="24px"
//                 glowIntensity="sm"
//                 className="p-4 group hover:scale-105 transition-all duration-300 cursor-pointer"
//               >
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
//                     <MapPin className="w-6 h-6 text-green-400" />
//                   </div>
//                   <div className="flex-1">
//                     <h4 className="font-semibold text-white text-sm">آدرس</h4>
//                     <p className="text-gray-400 text-xs leading-relaxed">
//                       {loading
//                         ? "..."
//                         : settings?.contactAddress ||
//                           "تهران، بزرگراه اشرفی اصفهانی، بالاتر از میدان پونک، مجتمع نیایش"}
//                     </p>
//                   </div>
//                 </div>
//               </LiquidGlassCard>
//             </a>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
