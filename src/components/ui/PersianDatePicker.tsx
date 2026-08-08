// src/components/ui/PersianDatePicker.tsx
import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronRight, ChevronLeft, X, Clock } from "lucide-react";
import { toGregorian, toJalaali } from "jalaali-js";

interface PersianDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  includeTime?: boolean;
  disabled?: boolean;
}

const persianMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const persianWeekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

const persianToGregorian = (persianDate: string): string => {
  if (!persianDate) return "";
  if (persianDate.includes("T") || persianDate.includes("-"))
    return persianDate;

  try {
    const [jy, jm, jd] = persianDate.split("/").map(Number);
    if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return persianDate;

    const { gy, gm, gd } = toGregorian(jy, jm, jd);
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");

    return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}T${h}:${m}:${s}`;
  } catch (error) {
    console.error("Error converting persian to gregorian:", error);
    return persianDate;
  }
};

const gregorianToPersian = (gregorianDate: string): string => {
  if (!gregorianDate) return "";
  if (gregorianDate.includes("/")) return gregorianDate;

  try {
    const date = new Date(gregorianDate);
    if (isNaN(date.getTime())) return gregorianDate;

    const gy = date.getFullYear();
    const gm = date.getMonth() + 1;
    const gd = date.getDate();

    const { jy, jm, jd } = toJalaali(gy, gm, gd);
    return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
  } catch {
    return gregorianDate;
  }
};

const getCurrentPersianDate = (): string => {
  return gregorianToPersian(new Date().toISOString());
};

const getDaysInMonth = (year: number, month: number) => {
  const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  if (month !== 12) return daysInMonth[month - 1];
  const isLeap =
    year % 33 === 1 || year % 33 === 2 || year % 33 === 3 || year % 33 === 29;
  return isLeap ? 30 : 29;
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  const { gy, gm, gd } = toGregorian(year, month, 1);
  const date = new Date(gy, gm - 1, gd);
  const day = date.getDay();
  return day === 6 ? 0 : day + 1;
};

const extractTime = (isoDate: string): string => {
  if (!isoDate) return "00:00";
  if (isoDate.includes("T")) {
    return isoDate.split("T")[1].substring(0, 5);
  }
  return "00:00";
};

export const PersianDatePicker = ({
  value,
  onChange,
  placeholder,
  className,
  includeTime = false,
  disabled = false,
}: PersianDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(1405);
  const [currentMonth, setCurrentMonth] = useState(4);
  const [days, setDays] = useState<number[]>([]);
  const [firstDayOffset, setFirstDayOffset] = useState(0);
  const [selectedTime, setSelectedTime] = useState("00:00");
  const pickerRef = useRef<HTMLDivElement>(null);

  const displayValue = value ? gregorianToPersian(value) : "";
  const timeValue = value ? extractTime(value) : "00:00";

  useEffect(() => {
    if (value && value.includes("T")) {
      setSelectedTime(extractTime(value));
    }
  }, [value]);

  useEffect(() => {
    let persianDate = displayValue;
    if (!persianDate && value && value.includes("-")) {
      persianDate = gregorianToPersian(value);
    }

    if (persianDate?.includes("/")) {
      const parts = persianDate.split("/");
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
          setCurrentYear(year);
          setCurrentMonth(month);
        }
      }
    }
  }, [value, displayValue]);

  useEffect(() => {
    if (currentYear > 0 && currentMonth > 0 && currentMonth <= 12) {
      const daysCount = getDaysInMonth(currentYear, currentMonth);
      setDays(Array.from({ length: daysCount }, (_, i) => i + 1));
      setFirstDayOffset(getFirstDayOfMonth(currentYear, currentMonth));
    } else {
      setDays([]);
      setFirstDayOffset(0);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setSelectedTime(newTime);

    if (value && value.includes("T")) {
      const datePart = value.split("T")[0];
      const newValue = `${datePart}T${newTime}:00`;
      onChange(newValue);
    }
  };

  const handleDateSelect = (day: number) => {
    const persianDate = `${currentYear}/${String(currentMonth).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
    let gregorianDate = persianToGregorian(persianDate);

    if (includeTime && selectedTime) {
      const datePart = gregorianDate.split("T")[0];
      gregorianDate = `${datePart}T${selectedTime}:00`;
    }

    onChange(gregorianDate);
    setIsOpen(false);
  };

  const handleTodayClick = () => {
    const today = getCurrentPersianDate();
    let gregorianDate = persianToGregorian(today);

    if (includeTime && selectedTime) {
      const datePart = gregorianDate.split("T")[0];
      gregorianDate = `${datePart}T${selectedTime}:00`;
    }

    onChange(gregorianDate);
    setIsOpen(false);
  };

  const handleClearClick = () => {
    onChange("");
    setIsOpen(false);
  };

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const prevYear = () => setCurrentYear(currentYear - 1);
  const nextYear = () => setCurrentYear(currentYear + 1);

  const isToday = (day: number) => {
    const today = getCurrentPersianDate();
    const selected = `${currentYear}/${String(currentMonth).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
    return today === selected;
  };

  const isSelected = (day: number) => {
    const selected = `${currentYear}/${String(currentMonth).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
    return displayValue === selected;
  };

  return (
    <div className="relative w-full" ref={pickerRef}>
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={displayValue}
              readOnly
              disabled={disabled}
              placeholder={placeholder || "انتخاب تاریخ"}
              className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 ${
                disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              } ${className || ""}`}
              dir="ltr"
              onClick={() => !disabled && setIsOpen(!isOpen)}
            />
            <Calendar
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 cursor-pointer hover:text-white/60 transition-colors"
              onClick={() => !disabled && setIsOpen(!isOpen)}
            />
            {displayValue && (
              <button
                type="button"
                onClick={handleClearClick}
                className="absolute left-10 top-1/2 transform -translate-y-1/2 hover:bg-white/10 rounded-full p-0.5 transition-colors"
              >
                <X className="w-4 h-4 text-white/40 hover:text-white/60" />
              </button>
            )}
          </div>
          {includeTime && (
            <div className="relative w-32">
              <input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                disabled={disabled}
                className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 font-mono ${
                  disabled ? "opacity-60 cursor-not-allowed" : ""
                }`}
                dir="ltr"
              />
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* 🔥 تقویم با z-index بسیار بالا و موقعیت بهبود یافته */}
      {isOpen && !disabled && (
        <div 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[99999] bg-gradient-to-br from-gray-900/95 to-blue-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5 w-80 max-h-[90vh] overflow-y-auto"
          style={{ 
            zIndex: 99999,
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-bold text-lg">انتخاب تاریخ</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white/60 hover:text-white" />
            </button>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={prevYear}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <span className="font-bold text-white text-base">
              {persianMonths[currentMonth - 1]} {currentYear}
            </span>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextYear}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Week days */}
          <div className="grid grid-cols-7 gap-1 mb-3 border-b border-white/5 pb-2">
            {persianWeekDays.map((d, i) => (
              <div
                key={i}
                className="text-center text-xs text-white/40 py-1 font-medium"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="text-center py-2" />
            ))}
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleDateSelect(day)}
                className={`text-center py-2 text-sm rounded-xl transition-all duration-200
                  ${
                    isSelected(day)
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 scale-105"
                      : isToday(day)
                        ? "bg-white/10 text-white border border-blue-400/30"
                        : "text-white/70 hover:bg-white/10 hover:text-white hover:scale-105"
                  }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={handleTodayClick}
              className="flex-1 px-3 py-1.5 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-colors font-medium"
            >
              امروز
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 text-white/60 rounded-xl transition-colors"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { persianToGregorian };
