// src/components/ui/GlassBirthdayPicker.tsx
import React, { useState, useEffect } from "react";

interface BirthdayPickerProps {
  onDateChange?: (date: { day: number; month: number; year: number }) => void;
  onChange?: (date: string) => void;
  value?: string;
  initialDate?: { day: number; month: number; year: number };
  className?: string;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
}

// تابع تبدیل اعداد انگلیسی به فارسی
const toPersianDigits = (num: number | string): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

// تبدیل تاریخ میلادی به شمسی
const gregorianToJalali = (
  gy: number,
  gm: number,
  gd: number,
): [number, number, number] => {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 366);
    days = (days - 1) % 366;
  }
  let jm =
    days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  let jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
};

// تبدیل تاریخ شمسی به میلادی
const jalaliToGregorian = (
  jy: number,
  jm: number,
  jd: number,
): [number, number, number] => {
  let gy = jy <= 979 ? 621 : 1600;
  let days =
    (jy - gy) * 365 +
    Math.floor((jy - gy) / 4) -
    Math.floor((jy - gy) / 100) +
    Math.floor((jy - gy) / 400);
  days += jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186;
  days += jd - 1;
  let gy2 = gy + 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy2 += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy2 += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy2 += Math.floor((days - 1) / 366);
    days = (days - 1) % 366;
  }
  let gm =
    days < 31
      ? 1
      : days < 59
        ? 2
        : days < 90
          ? 3
          : days < 120
            ? 4
            : days < 151
              ? 5
              : days < 181
                ? 6
                : days < 212
                  ? 7
                  : days < 243
                    ? 8
                    : days < 273
                      ? 9
                      : days < 304
                        ? 10
                        : days < 334
                          ? 11
                          : 12;
  let gd =
    days +
    1 -
    [
      0,
      31,
      gm > 2 && !((gy2 % 4 === 0 && gy2 % 100 !== 0) || gy2 % 400 === 0)
        ? 59
        : gm > 2
          ? 60
          : 0,
      90,
      120,
      151,
      181,
      212,
      243,
      273,
      304,
      334,
    ][gm - 1];
  return [gy2, gm, gd];
};

// نام ماه‌های شمسی
const persianMonths = [
  { value: "1", label: "فروردین" },
  { value: "2", label: "اردیبهشت" },
  { value: "3", label: "خرداد" },
  { value: "4", label: "تیر" },
  { value: "5", label: "مرداد" },
  { value: "6", label: "شهریور" },
  { value: "7", label: "مهر" },
  { value: "8", label: "آبان" },
  { value: "9", label: "آذر" },
  { value: "10", label: "دی" },
  { value: "11", label: "بهمن" },
  { value: "12", label: "اسفند" },
];

const GlassBirthdayPicker: React.FC<BirthdayPickerProps> = ({
  onDateChange,
  onChange,
  value,
  initialDate,
  className = "",
  label = "",
  disabled = false,
}) => {
  // تابع تبدیل string تاریخ شمسی به object
  const parsePersianDateFromString = (dateStr: string) => {
    if (!dateStr) return { year: "", month: "", day: "" };
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return {
        year: parts[0],
        month: parts[1],
        day: parts[2],
      };
    }
    return { year: "", month: "", day: "" };
  };

  // مقداردهی اولیه از value (که شمسی است)
  const initialFromValue = value ? parsePersianDateFromString(value) : null;

  // State برای تاریخ شمسی (برای نمایش)
  const [persianYear, setPersianYear] = useState<string>(
    initialFromValue?.year || initialDate?.year?.toString() || "",
  );
  const [persianMonth, setPersianMonth] = useState<string>(
    initialFromValue?.month || initialDate?.month?.toString() || "",
  );
  const [persianDay, setPersianDay] = useState<string>(
    initialFromValue?.day || initialDate?.day?.toString() || "",
  );

  // ✅ وقتی value از بیرون تغییر کند
  useEffect(() => {
    if (value) {
      const parsed = parsePersianDateFromString(value);
      setPersianYear(parsed.year);
      // ✅ حذف صفر جلو (مثلاً "09" → "9")
      setPersianMonth(parsed.month ? String(parseInt(parsed.month)) : "");
      setPersianDay(parsed.day ? String(parseInt(parsed.day)) : "");
    }
  }, [value]);

  // ✅ وقتی initialDate تغییر کند
  useEffect(() => {
    if (initialDate) {
      setPersianYear(initialDate.year?.toString() || "");
      setPersianMonth(initialDate.month?.toString() || "");
      setPersianDay(initialDate.day?.toString() || "");
    }
  }, [initialDate]);

  // تولید سال‌های شمسی (از 1300 تا سال جاری شمسی)
  const getCurrentPersianYear = () => {
    const now = new Date();
    const [jy] = gregorianToJalali(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
    );
    return jy;
  };

  const currentPersianYear = getCurrentPersianYear();
  const persianYears = Array.from(
    { length: 100 },
    (_, i) => currentPersianYear - i,
  );

  // تعداد روزهای ماه شمسی
  const getPersianDaysInMonth = (month: string, year: string) => {
    if (!month || !year) return 31;
    const m = parseInt(month);
    const y = parseInt(year);
    if (m <= 6) return 31;
    if (m <= 11) return 30;
    const leapYears = [1, 5, 9, 13, 17, 22, 26, 30];
    const remainder = y % 33;
    return leapYears.includes(remainder) ? 30 : 29;
  };

  const daysInMonth = getPersianDaysInMonth(persianMonth, persianYear);
  const persianDays = Array.from({ length: daysInMonth }, (_, i) =>
    (i + 1).toString(),
  );

  const handlePersianChange = (
    type: "day" | "month" | "year",
    newValue: string,
  ) => {
    let newPersianYear = persianYear;
    let newPersianMonth = persianMonth;
    let newPersianDay = persianDay;

    if (type === "year") newPersianYear = newValue;
    else if (type === "month") newPersianMonth = newValue;
    else if (type === "day") newPersianDay = newValue;

    // اگر روز تغییر کرد و از تعداد روزهای ماه بیشتر بود، اصلاح کن
    if (type === "month" || type === "year") {
      const maxDay = getPersianDaysInMonth(
        type === "month" ? newValue : persianMonth,
        type === "year" ? newValue : persianYear,
      );
      if (newPersianDay && parseInt(newPersianDay) > maxDay) {
        newPersianDay = "";
      }
    }

    setPersianYear(newPersianYear);
    setPersianMonth(newPersianMonth);
    setPersianDay(newPersianDay);

    // اگر همه مقادیر پر بود، تاریخ شمسی را برگردان
    if (newPersianDay && newPersianMonth && newPersianYear) {
      // فرمت شمسی: YYYY-MM-DD
      const persianDateString = `${newPersianYear}-${String(newPersianMonth).padStart(2, "0")}-${String(newPersianDay).padStart(2, "0")}`;

      if (onChange) onChange(persianDateString);

      // همچنین تاریخ میلادی را برای onDateChange برگردان
      if (onDateChange) {
        const [gy, gm, gd] = jalaliToGregorian(
          parseInt(newPersianYear),
          parseInt(newPersianMonth),
          parseInt(newPersianDay),
        );
        onDateChange({
          day: gd,
          month: gm,
          year: gy,
        });
      }
    } else {
      if (onChange) onChange("");
      if (onDateChange) {
        onDateChange({
          day: 0,
          month: 0,
          year: 0,
        });
      }
    }
  };

  const selectClassName = `flex-1 min-w-[80px] px-4 py-3 
    bg-white/10 backdrop-blur-xl 
    border border-white/20 
    rounded-xl text-white 
    text-base focus:outline-none focus:ring-2 
    focus:ring-indigo-400/50 
    transition-all duration-200 
    hover:bg-white/20 hover:border-white/30
    appearance-none cursor-pointer
    shadow-lg
    ${disabled ? "opacity-50 cursor-not-allowed hover:bg-white/10" : ""}`;

  // نمایش تاریخ انتخاب شده به فارسی
  // const selectedDate =
  //   persianYear && persianMonth && persianDay
  //     ? `${toPersianDigits(persianYear)}/${toPersianDigits(persianMonth)}/${toPersianDigits(persianDay)}`
  //     : "";

  // // ✅ پیدا کردن نام ماه انتخاب شده برای نمایش
  // const selectedMonthLabel = persianMonth
  //   ? persianMonths.find((m) => m.value === persianMonth)?.label
  //   : "";

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white/90 mb-2 text-right">
          {label}
        </label>
      )}

      <div className="flex gap-3 justify-center rtl:space-x-reverse">
        <select
          value={persianYear}
          onChange={(e) => handlePersianChange("year", e.target.value)}
          disabled={disabled}
          className={selectClassName}
        >
          <option value="" className="bg-gray-800 text-white">
            سال
          </option>
          {persianYears.map((y) => (
            <option key={y} value={y} className="bg-gray-800 text-white">
              {toPersianDigits(y)}
            </option>
          ))}
        </select>

        <select
          value={persianMonth}
          onChange={(e) => handlePersianChange("month", e.target.value)}
          disabled={disabled}
          className={selectClassName}
        >
          <option value="" className="bg-gray-800 text-white">
            ماه
          </option>
          {persianMonths.map((m) => (
            <option
              key={m.value}
              value={m.value}
              className="bg-gray-800 text-white"
            >
              {m.label}
            </option>
          ))}
        </select>

        <select
          value={persianDay}
          onChange={(e) => handlePersianChange("day", e.target.value)}
          disabled={disabled || !persianMonth || !persianYear}
          className={selectClassName}
        >
          <option value="" className="bg-gray-800 text-white">
            روز
          </option>
          {persianDays.map((d) => (
            <option key={d} value={d} className="bg-gray-800 text-white">
              {toPersianDigits(d)}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ نمایش تاریخ انتخاب شده به صورت فارسی با نام ماه */}
      {/* {selectedDate && selectedMonthLabel && (
        <div className="mt-3 text-center text-white/70 text-sm">
          تاریخ انتخاب شده:
          <span className="text-white font-medium">
            {toPersianDigits(persianDay)} {selectedMonthLabel}{" "}
            {toPersianDigits(persianYear)}
          </span>
        </div>
      )} */}
    </div>
  );
};

export default GlassBirthdayPicker;
