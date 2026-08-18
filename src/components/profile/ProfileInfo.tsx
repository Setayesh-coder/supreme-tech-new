// src/components/profile/ProfileInfo.tsx
import { LiquidGlassCard } from "../ui/LiquidGlassCard";
import { GlassButton } from "../ui/GlassButton";
import {
  Edit2,
  Save,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Check,
} from "lucide-react";
import GlassBirthdayPicker from "../ui/GlassBirthdayPicker";
import { useState, useEffect } from "react";
import moment from "moment-jalaali";

interface ProfileInfoProps {
  user: any;
  formData: any;
  editing: boolean;
  saving: boolean;
  error: string;
  success: string;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onLogout: () => void;
}

// تبدیل تاریخ میلادی به شمسی (فرمت YYYY-MM-DD)
const gregorianToJalali = (gy: number, gm: number, gd: number): string => {
  try {
    const date = new Date(gy, gm - 1, gd);
    const persianDate = moment(date);
    return persianDate.format("jYYYY-jMM-jDD");
  } catch (error) {
    console.error("خطا در تبدیل تاریخ میلادی به شمسی:", error);
    return "";
  }
};

// تبدیل تاریخ شمسی به میلادی (فرمت YYYY-MM-DD)
const jalaliToGregorian = (jy: number, jm: number, jd: number): string => {
  try {
    // ایجاد تاریخ شمسی
    const persianDate = moment(`${jy}/${jm}/${jd}`, "jYYYY/jM/jD");
    if (!persianDate.isValid()) {
      console.error("تاریخ شمسی نامعتبر است");
      return "";
    }
    // تبدیل به میلادی
    const gregorianDate = persianDate.toDate();
    const year = gregorianDate.getFullYear();
    const month = String(gregorianDate.getMonth() + 1).padStart(2, "0");
    const day = String(gregorianDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("خطا در تبدیل تاریخ شمسی به میلادی:", error);
    return "";
  }
};

export default function ProfileInfo({
  user,
  formData,
  editing,
  saving,
  error,
  success,
  onEdit,
  onCancel,
  onSave,
  onChange,
  onLogout,
}: ProfileInfoProps) {
  // State برای نگهداری تاریخ شمسی
  const [persianBirthDate, setPersianBirthDate] = useState<string>("");

  // تبدیل تاریخ میلادی به شمسی برای نمایش
  useEffect(() => {
    if (formData.birthDate) {
      const parts = formData.birthDate.split("-");
      if (parts.length === 3) {
        const gy = parseInt(parts[0]);
        const gm = parseInt(parts[1]);
        const gd = parseInt(parts[2]);

        if (gy && gm && gd) {
          const persianDate = gregorianToJalali(gy, gm, gd);
          if (persianDate) {
            // تبدیل از فرمت jYYYY-jMM-jDD به YYYY-MM-DD
            const persianParts = persianDate.split("-");
            if (persianParts.length === 3) {
              const formattedDate = `${persianParts[0]}-${String(parseInt(persianParts[1])).padStart(2, "0")}-${String(parseInt(persianParts[2])).padStart(2, "0")}`;
              setPersianBirthDate(formattedDate);
            }
          }
        }
      }
    } else {
      setPersianBirthDate("");
    }
  }, [formData.birthDate]);

  // تبدیل تاریخ شمسی به میلادی برای ذخیره
  const handleDateChange = (persianDate: string) => {
    console.log("📅 تاریخ شمسی انتخاب شده:", persianDate);

    if (persianDate) {
      const parts = persianDate.split("-");
      if (parts.length === 3) {
        const jy = parseInt(parts[0]);
        const jm = parseInt(parts[1]);
        const jd = parseInt(parts[2]);

        if (jy && jm && jd) {
          const gregorianDate = jalaliToGregorian(jy, jm, jd);

          if (gregorianDate) {
            console.log(" تاریخ میلادی برای ذخیره:", gregorianDate);

            const event = {
              target: {
                name: "birthDate",
                value: gregorianDate,
              },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
          } else {
            console.error("❌ تبدیل تاریخ ناموفق بود");
          }
        }
      }
    } else {
      const event = {
        target: {
          name: "birthDate",
          value: "",
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };

  return (
    <LiquidGlassCard
      className="p-6"
      borderRadius="16px"
      blurIntensity="lg"
      glowIntensity="md"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">اطلاعات شخصی</h2>
        {!editing ? (
          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
          >
            <Edit2 size={18} />
          </button>
        ) : null}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-2 rounded-lg mb-4 text-sm">
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-2 rounded-lg mb-4 text-sm">
          <Check/> {success}
        </div>
      )}

      <div className="space-y-3">
        {/* نام کامل */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1">
            نام کامل
          </label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={onChange}
              disabled={!editing}
              className={`w-full pr-10 pl-3 py-2 bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors ${
                editing
                  ? "border-white/20 focus:border-blue-500"
                  : "border-transparent cursor-default"
              }`}
              placeholder="نام کامل"
            />
          </div>
        </div>

        {/* شماره تلفن */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1">
            شماره تلفن
          </label>
          <div className="relative">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              name="phone"
              value={formData.phone || ""}
              onChange={onChange}
              disabled={!editing}
              className={`w-full pr-10 pl-3 py-2 bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors ${
                editing
                  ? "border-white/20 focus:border-blue-500"
                  : "border-transparent cursor-default"
              }`}
              placeholder="شماره تلفن"
            />
          </div>
        </div>

        {/* ایمیل */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1">
            ایمیل
          </label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={onChange}
              disabled={!editing}
              className={`w-full pr-10 pl-3 py-2 bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors ${
                editing
                  ? "border-white/20 focus:border-blue-500"
                  : "border-transparent cursor-default"
              }`}
              placeholder="ایمیل (اختیاری)"
            />
          </div>
        </div>

        {/* استان */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              استان محل سکونت
            </span>
          </label>
          <div className="relative">
            <select
              name="province"
              value={user.province || ""}
              onChange={onChange}
              disabled={!editing}
              className={`w-full pr-3 pl-3 py-2 bg-white/5 border rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none ${
                editing
                  ? "border-white/20 focus:border-blue-500"
                  : "border-transparent cursor-default"
              }`}
            >
              <option value="">انتخاب استان</option>
              <option value="آذربایجان شرقی">آذربایجان شرقی</option>
              <option value="آذربایجان غربی">آذربایجان غربی</option>
              <option value="اردبیل">اردبیل</option>
              <option value="اصفهان">اصفهان</option>
              <option value="البرز">البرز</option>
              <option value="ایلام">ایلام</option>
              <option value="بوشهر">بوشهر</option>
              <option value="تهران">تهران</option>
              <option value="چهارمحال و بختیاری">چهارمحال و بختیاری</option>
              <option value="خراسان جنوبی">خراسان جنوبی</option>
              <option value="خراسان رضوی">خراسان رضوی</option>
              <option value="خراسان شمالی">خراسان شمالی</option>
              <option value="خوزستان">خوزستان</option>
              <option value="زنجان">زنجان</option>
              <option value="سمنان">سمنان</option>
              <option value="سیستان و بلوچستان">سیستان و بلوچستان</option>
              <option value="فارس">فارس</option>
              <option value="قزوین">قزوین</option>
              <option value="قم">قم</option>
              <option value="کردستان">کردستان</option>
              <option value="کرمان">کرمان</option>
              <option value="کرمانشاه">کرمانشاه</option>
              <option value="کهگیلویه و بویراحمد">کهگیلویه و بویراحمد</option>
              <option value="گلستان">گلستان</option>
              <option value="گیلان">گیلان</option>
              <option value="لرستان">لرستان</option>
              <option value="مازندران">مازندران</option>
              <option value="مرکزی">مرکزی</option>
              <option value="هرمزگان">هرمزگان</option>
              <option value="همدان">همدان</option>
              <option value="یزد">یزد</option>
            </select>
          </div>
        </div>

        {/* تاریخ تولد */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              تاریخ تولد
            </span>
          </label>
          <GlassBirthdayPicker
            value={persianBirthDate}
            onChange={handleDateChange}
            placeholder="انتخاب تاریخ تولد"
            className="w-full"
            disabled={!editing}
          />
          {!editing && formData.birthDate && (
            <p className="text-xs text-white/50 mt-1">
              تاریخ ثبت شده: {persianBirthDate}
            </p>
          )}
          {!editing && !formData.birthDate && (
            <p className="text-xs text-white/30 mt-1">
              تاریخ تولدی ثبت نشده است
            </p>
          )}
        </div>

        {/* جنسیت */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              جنسیت
            </span>
          </label>
          <div className="relative">
            <select
              name="gender"
              value={user.gender || ""}
              onChange={onChange}
              disabled={!editing}
              className={`w-full pr-3 pl-3 py-2 bg-white/5 border rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none ${
                editing
                  ? "border-white/20 focus:border-blue-500"
                  : "border-transparent cursor-default"
              }`}
            >
              <option value="">انتخاب جنسیت</option>
              <option value="MALE">مرد</option>
              <option value="FEMALE">زن</option>
            </select>
          </div>
        </div>
      </div>

      {/* دکمه‌های ویرایش/ذخیره */}
      {editing ? (
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
          <GlassButton
            variant="primary"
            size="sm"
            onClick={onSave}
            loading={saving}
            className="flex-1"
          >
            <Save className="w-4 h-4 ml-1" />
            ذخیره تغییرات
          </GlassButton>
          <GlassButton
            variant="white"
            size="sm"
            onClick={onCancel}
            className="flex-1"
          >
            <X className="w-4 h-4 ml-1" />
            انصراف
          </GlassButton>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full text-center text-sm text-red-400 hover:text-red-300 transition-colors py-2"
          >
            خروج از حساب
          </button>
        </div>
      )}
    </LiquidGlassCard>
  );
}
